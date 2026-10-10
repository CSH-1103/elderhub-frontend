/**
 * 开发环境种子数据脚本
 * 用法：npm run seed
 * 作用：
 *  1. 给 customer 表补齐代码中使用但建表 SQL 缺失的 user_id / butler_id 列
 *  2. 插入角色（1 管理员 / 2 健康管家）
 *  3. 插入测试账号：admin/123456（管理员）、butler/123456（健康管家）
 *  4. 插入最小演示数据：房间/床位/客户/床位使用详情/护理级别/项目/客户已购项目
 */
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const DB = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'elderhub',
}

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB.database, table, column]
  )
  return rows[0].n > 0
}

async function main() {
  const conn = await mysql.createConnection(DB)
  console.log('已连接数据库 elderhub')

  // 1. customer 表补列（后端代码使用但 08_biz_customer.sql 缺失）
  if (!(await columnExists(conn, 'customer', 'user_id'))) {
    await conn.query('ALTER TABLE customer ADD COLUMN user_id int DEFAULT NULL COMMENT "管家用户ID"')
    console.log('customer.user_id 列已添加')
  }
  if (!(await columnExists(conn, 'customer', 'butler_id'))) {
    await conn.query('ALTER TABLE customer ADD COLUMN butler_id int DEFAULT NULL COMMENT "健康管家ID"')
    console.log('customer.butler_id 列已添加')
  }

  // 2. 角色
  await conn.query(
    `INSERT INTO role (id, name) VALUES (1, '管理员'), (2, '健康管家')
     ON DUPLICATE KEY UPDATE name = VALUES(name)`
  )
  console.log('角色就绪')

  // 3. 测试账号（BCrypt 密码）
  const hash = bcrypt.hashSync('123456', 10)
  const [users] = await conn.query("SELECT id, username FROM user WHERE username IN ('admin','butler')")
  const existing = new Map(users.map((u) => [u.username, u.id]))
  if (!existing.has('admin')) {
    const [r] = await conn.query(
      `INSERT INTO user (nickname, username, password, sex, phone_number, role_id, create_by, is_deleted)
       VALUES ('系统管理员', 'admin', ?, 1, '13800000001', 1, 0, 0)`,
      [hash]
    )
    existing.set('admin', r.insertId)
    console.log('已创建管理员 admin/123456')
  }
  if (!existing.has('butler')) {
    const [r] = await conn.query(
      `INSERT INTO user (nickname, username, password, sex, phone_number, role_id, create_by, is_deleted)
       VALUES ('管家小李', 'butler', ?, 0, '13800000002', 2, 0, 0)`,
      [hash]
    )
    existing.set('butler', r.insertId)
    console.log('已创建健康管家 butler/123456')
  }
  const butlerId = existing.get('butler')

  // 4. 最小演示数据（各表独立幂等检查，可重复运行）
  const [rooms] = await conn.query('SELECT COUNT(*) AS n FROM room')
  if (rooms[0].n === 0) {
    await conn.query(
      `INSERT INTO room (room_floor, room_no) VALUES ('1', 101), ('1', 102), ('2', 201)`
    )
    console.log('房间演示数据已插入')
  }
  const [beds] = await conn.query('SELECT COUNT(*) AS n FROM bed')
  if (beds[0].n === 0) {
    await conn.query(
      `INSERT INTO bed (bed_no, room_no, bed_status, remarks) VALUES
        ('101-1', 101, 2, '张大爷在住'),
        ('101-2', 101, 1, NULL),
        ('102-1', 102, 2, '李奶奶在住'),
        ('102-2', 102, 1, NULL),
        ('201-1', 201, 1, NULL),
        ('201-2', 201, 3, '外出中')`
    )
    console.log('床位演示数据已插入')
  }

  // 5. 客户 + 床位使用详情（按客户名独立检查）
  const [zhang] = await conn.query("SELECT id FROM customer WHERE customer_name = '张大爷'")
  if (zhang.length === 0) {
    const [c1] = await conn.query(
      `INSERT INTO customer
        (customer_name, customer_age, customer_sex, idcard, room_no, building_no, bed_id,
         checkin_date, expiration_date, contact_tel, birthday, height, weight, blood_type,
         psychosomatic_state, attention, filepath, is_deleted, user_id, butler_id)
       VALUES
        ('张大爷', 78, 0, '110101194801011234', '101', '1栋', 1,
         '2026-01-10', '2027-01-10', '13911112222', '1948-01-01', '172', '65', 'A',
         '腿脚不便，需要助行', '按时服药', '/img/c1.png', 0, ?, ?),
        ('李奶奶', 82, 1, '110101194405054321', '102', '1栋', 3,
         '2026-03-15', '2027-03-15', '13933334444', '1944-05-05', '158', '50', 'B',
         '轻度认知障碍', '防走失', '/img/c2.png', 0, -1, NULL)`,
      [butlerId, butlerId]
    )
    await conn.query(
      `INSERT INTO bed_details (customer_id, bed_id, start_date, bed_details, end_date, is_deleted)
       VALUES (?, 1, '2026-01-10', '长住', NULL, 0), (?, 3, '2026-03-15', '长住', NULL, 0)`,
      [c1.insertId, c1.insertId + 1]
    )
    console.log('客户/床位使用详情演示数据已插入')
  } else {
    // 兜底：客户存在但 bed_details 缺失时补齐
    const [bd] = await conn.query('SELECT COUNT(*) AS n FROM bed_details')
    if (bd[0].n === 0) {
      const [rows] = await conn.query(
        "SELECT id, bed_id, checkin_date FROM customer WHERE customer_name IN ('张大爷','李奶奶') AND bed_id IS NOT NULL"
      )
      for (const c of rows) {
        await conn.query(
          `INSERT INTO bed_details (customer_id, bed_id, start_date, bed_details, end_date, is_deleted)
           VALUES (?, ?, ?, '长住', NULL, 0)`,
          [c.id, c.bed_id, c.checkin_date]
        )
      }
      console.log('床位使用详情已补齐')
    }
  }

  // 6. 护理级别 / 护理项目 / 客户已购项目（各自独立检查）
  const [lv] = await conn.query('SELECT COUNT(*) AS n FROM nurse_level')
  if (lv[0].n === 0) {
    await conn.query(
      `INSERT INTO nurse_level (level_name, level_status, is_deleted) VALUES ('一级护理', 1, 0), ('二级护理', 1, 0)`
    )
    console.log('护理级别演示数据已插入')
  }
  const [ct] = await conn.query('SELECT COUNT(*) AS n FROM nurse_content')
  if (ct[0].n === 0) {
    await conn.query(
      `INSERT INTO nurse_content (serial_number, nursing_name, service_price, message, status, execution_cycle, execution_times, is_deleted)
       VALUES
        ('HL001', '晨间护理', 30, '起床、洗漱、整理床铺', 1, '每日', '1次/天', 0),
        ('HL002', '口腔护理', 20, '早晚口腔清洁', 1, '每日', '2次/天', 0)`
    )
    console.log('护理项目演示数据已插入')
  }
  const [cni] = await conn.query('SELECT COUNT(*) AS n FROM customer_nurse_item')
  if (cni[0].n === 0) {
    const [cust] = await conn.query("SELECT id FROM customer WHERE customer_name = '张大爷'")
    const [item] = await conn.query("SELECT id FROM nurse_content WHERE serial_number = 'HL001'")
    const [level] = await conn.query("SELECT id FROM nurse_level WHERE level_name = '一级护理'")
    if (cust.length && item.length && level.length) {
      await conn.query(
        `INSERT INTO customer_nurse_item (customer_id, item_id, level_id, nurse_number, buy_time, maturity_time, is_deleted)
         VALUES (?, ?, ?, 30, '2026-01-10', '2026-12-31', 0)`,
        [cust[0].id, item[0].id, level[0].id]
      )
      console.log('客户已购护理项目演示数据已插入')
    }
  }

  console.log('种子数据完成。测试账号：admin/123456（管理员）、butler/123456（健康管家）')
  await conn.end()
}

main().catch((e) => {
  console.error('种子数据执行失败：', e.message)
  process.exit(1)
})
