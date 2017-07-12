﻿const i18n = {
  install(Vue, options) {
    Vue.language = "zhCN";
    Vue.mixin({
      methods: {
        text(text, ...d) {
          let dict = {
            zhCN: {
              'ACTIVITY':'活动',
              'ACCOUNT': '账号',
              'ACTION': '操作',
              'ACTIVATION': '激活',
              'ACCESS':'开启',
              'ADJUST': '调整',
              'ADD_VALUE': '充值',
              'ADD_SIDE': '添加附菜',
              'ADDRESS': '地址',
              'ADJUST_TIP': '调整小费',
              'ASIAN': '亚洲人',
              'AUTO_LOGOUT': '自动登出',
              'ALL_RECORDS': '所有记录',
              'ANY_QTY': '任意选择',
              'APPETIZER': '头台',
              'API_KEY': '身份验证',
              'ALIES': '别名',
              'APPLY': '应用',
              'AREA': '区域',
              'AUTH_CODE':'授权码',
              'ALL_INVOICE': '全部订单',
              'ARRANGE': '安排',
              'ASSIGN_WAITER': '指派服务员',
              'ASSIGN': '指派',
              'AUTO_CHARGE':'自动收费',
              'AUTO_CHARGE_ABOVE':'(N)客人以上',
              'AUTO_CLEAN_TABLE': '自动清空座位',
              'BAR': '酒吧',
              'BACK': '返回',
              'BATCH': '过账',
              'BAD_CUST': '坏客人',
              'BLACK': '黑人',
              'BASIC_INFO': '基本信息',
              'BALANCE_DUE': '余款',
              'BALANCE_REMAIN': '尾款',
              'BINDING':'绑定',
              'BUZZER': '铃声',
              'BY_CALENDAR': '按日期',
              'BY_CASHIER': '按收银',
              'BY_DRIVER': '按司机',
              'CHANGE': `请找 $${d[0]}`,
              'CUST_PAID': `客人向您支付了 $${d[0]}`,
              'CLOCK_IN_REQ': '请先打卡',
              'CUST_SEAT': '客人座位',
              'CONFIRM_ORD_TYP_SW': '确定更改',
              'CONTAIN': '包含',
              'CAL_DIST': '计算距离',
              'CALL_LOG': '来电记录',
              'CASHDRAWER':'钱箱',
              'CUST_INFO': '客人信息',
              'CATEGORY': '类别',
              'CATEGORY_CN': '类别(中)',
              'CHANGE_DUE': '找零',
              'CONFIRM_RPT_CC_RCPT': '打印信用卡收据',
              'CONTACT': '联系电话',
              'CODE_EDITOR': '代码编辑',
              'CLEAR': '清除',
              'CLOCK_IN': '打卡',
              'CLOCK_OUT': '下班',
              'CLOCK_OUT_REPORT': '下班报告',
              'CLOCK_IN_CONFIRM': '打卡上班',
              'CLOCK_OUT_CONFIRM': '打卡下班',
              'CASH_OUT': '取现',
              'CONTINUE': '继续',
              'CHECKSUM': '对账',
              'CONFIRM&PRINT': '确定并打印',
              'CONFIRM': '确定',
              'CANCEL': '取消',
              'CANCEL': '取消',
              'CREATE': '创建',
              'CITY': '城市',
              'CONFIG':'设置',
              'CONNECT_DATABASE_FAILED': '数据库连接失败.',
              'COURSE_TIME': '延迟出单',
              'CASH': '现金',
              'COMBINE_TABLE': '拼桌',
              'CREDIT_CARD': '信用卡',
              'CLEAR': '清除',
              'CC_DUP_TRANS': '刷卡失败:信用卡重单',
              'CC_BAD_TRACK': '刷卡失败:无法读取信用卡磁条信息',
              'CC_TRANS_ABORT': '刷卡被取消',
              'CC_EXP_INVALID': '刷卡失败:过期日期不正确',
              'CC_DECLINED': '支付信用卡被拒绝',
              'CC_TIMEOUT': '交易超时',
              'CC_COMM_ERROR': '刷卡失败:请检查您的网络连接',
              'CC_UNKNOWN': '发生一个未知的错误',
              'CC_NUMBER': '卡号',
              'CC_EXP': '过期日期',
              'CVV': '安全号',
              'CANT_EDIT_VOIDED_ORDER': '无法修改订单',
              'CANT_EDIT_VOIDED_ORDER_TIP': `该订单已经被 ${d[0]} 取消，请先恢复订单再进行修改`,
              'CALCULATE': '计算',
              'CALLER_ID': '来电显示',
              'DATA': '数据',
              'DATABASE': '数据库',
              'DISHONEST': '失信',
              'DURATION': '路程',
              'DISTANCE': '距离',
              'DONE': '完成',
              'DEL_ITEM_TIP': `您确定要从物品列表里删除${d[0]}吗？`,
              'DP_CATEGORY': '显示类别',
              'DELIVERY_FEE': '送餐费',
              'DELIVERY': '送餐',
              'DEL_ORDER': '删单',
              'DEBIT_CARD': '借记卡',
              'DELIVERY_INVOICE': '送餐订单',
              'DELETE': '删除',
              'DINE_IN': '堂吃',
              'DISCOUNT': '折扣',
              'DISCOUNT': '折扣',
              'DINE_IN_INVOICE': '堂吃订单',
              'DINE_IN_DISABLED': '堂吃功能被关闭',
              'DYN_CHRG': '按路程收费',
              'DEL_ITEM_CONFIRM': '删除物品',
              'DRAWER_OPEN_PD': '无法打开钱箱',
              'DRAWER_OPEN_PD_TIP': '您没有开钱箱的权限，请联系经理来执行此操作',
              'DELIVERY_FREE': '免送餐费',
              'DESSERT': '点心',
              'DISABLE_AUTO_ADD': '禁止自动添加',
              'ENABLE': '启用',
              'EXTRA': '更多',
              'EVEN_SPLIT': '平摊',
              'E_MAIL': '电子邮箱',
              'EDIT_ORDER': '修改',
              'EDITOR.HEADER.TAX': '编辑税率',
              'EDITOR.HEADER.UI': '编辑界面',
              'EDITOR.HEADER.CATEGORY': '编辑类别',
              'EDITOR.HEADER.REQUEST': '编辑要求类别',
              'EDITOR.HEADER.ACTION': '编辑缀词',
              'EDITOR.HEADER.ITEM': '编辑物品',
              'EDITOR.TAX.TIP': '按照订单类别应用此税率',
              'EDITOR.HEADER.TEMPLATE': '模板编辑',
              'EDITOR.TEMPLATE.MAX': '选择上限',
              'EDITOR.TEMPLATE.ADDITION': '多选价格',
              'EDITOR.TEMPLATE.STARTAT': '额外价格',
              'EDITOR.EXIT.TIP': '退出设置',
              'EXTENSION': '分机',
              'EXIT': '退出',
              'EDIT': '编辑',
              'EMPLOYEE': '员工',
              'EXTEND': '延长',
              'ENTREE': '正餐',
              'EXIT_CFM': '您确定要退出吗？',
              'ERROR_CODE': `错误代码: ${d[0]}`,
              'FAR_AWAY': '距离远',
              'FRAUD': '信用欺骗',
              'FORCE_CLEAR': '强制还原',
              'FIRST_PAGE': '第一页',
              'FRI': '周五',
              'FONT': '字体',
              'FONT_SIZE': '字体大小',
              'GUEST_COUNT': '计客',
              'GET_PIN': 'PIN',
              'GOOGLE_MAP_SERVICE': '谷歌地图服务',
              'GRATUITY': '服务费',
              'GIFT_CARD': '礼物卡',
              'GOOD_CUST': '好客人',
              'GC_SWIPE': '请刷礼物卡',
              'GC_ACTIVATION': '礼物卡需要激活',
              'GC_CARD_NUMBER': `礼物卡号 (${d[0]})`,
              'HOTEL': '旅馆',
              'HOLD': '延迟',
              'HOUR': '小时',
              'HISTORY': '历史记录',
              'HOST_CONNECTED': '伺服器连接成功...',
              'ICON': '图标',
              'IMPOLITE': '没礼貌',
              'INIT_AMOUNT': '初始金额',
              'ITEM_PENDING': `${d[0]}个在队列中`,
              'ITEM_BUILDER': '物品选择',
              'ITEM_SEND': '发送成功',
              'ISSUE_GC': '激活新卡',
              'ITEM_EDITOR': '编辑物品',
              'INVOICE': '订单',
              'ITEM': '名称',
              'ITEM_INFO': '物品信息',
              'IS_SPICY': '辣',
              'ITEM_SIDE': '附菜',
              'INVALID_VALUE': `${d[0]}的格式不正确`,
              'INITIALIZING': '初始化...',
              'LAYOUT': '布局',
              'LESS': '减少',
              'LOOKING_FOR_HOST': '查找主机中...',
              'LOADING_CONFIG': '载入软件配置...',
              'LOADING_CONTENT': '载入数据中...',
              'LOGOUT': '登出',
              'LANGUAGE': '语言',
              'LANG': 'Language',
              'LACK_INFO': '缺少资料',
              'LOUSY_CUST': '麻烦',
              'MANAGER_CODE': '经理密码',
              'MARKER': '标记',
              'MANUAL_INPUT':'手动输入',
              'MINUTE': '分钟',
              'MORE': '增加',
              'MODIFY': '修改',
              'MON': '周一',
              'MODEL': '型号',
              'MAC': '物理地址',
              'MENU': '菜单',
              'MENU_ID': '物品ID',
              'MAX_ITEM': `最多${d[0]}个`,
              'MILE_COST': '每公里收费',
              'MEXICAN': '墨西哥人',
              'NEXT_PAGE': '下一页',
              'NEW_ORDER': '新单',
              'NAME': '名字',
              'NOTE': '备注',
              'NO_SERVICE': '黑名单',
              'NO_PREVS_ORDER': '无任何订单',
              'NO_PREVS_ORDER_TIP': '找不到任何订单，默认显示今天订单',
              'NEW_REPORT': '新报表',
              'ORDER_PAYMENT_REMOVED': `您成功的移除 #${d[0]} 订单的付款记录`,
              'ORDER_SPLIT': '分单',
              'ORDER': '订单',
              'PAYMENT': '付款',
              'PD_ACCESS': '权限不足',
              'PIN_INCORRECT': '密码错误',
              'PICK_UP': '来取',
              'PHONE': '电话',
              'PHONE_RQD': '缺少电话号码',
              'PLACE_ORDER': '下单',
              'PICK_COLOR': '指定颜色',
              'PRICE': '价格',
              'PREV_PAGE': '上一页',
              'PREFIX_VERB': '词缀前置',
              'POS_MAINTENANCE': '系统维护中',
              'POS_MAINTENANCE_TIP': '感谢您的耐心等候，我们马上搞定!',
              'PRE_PAYMENT': '预付单',
              'PAYMENT_REMOVE': '移除付款记录',
              'PAYMENT_REMOVE_CONFIRM': `您确定要移除订单的${d[0]}付款记录吗？`,
              'PAYMENT_REMOVED': '付款记录已移除',
              'PASSWORD': '密码',
              'PICK_UP_INVOICE': '来取订单',
              'PRT_CFM': '打印确定',
              'PYMT_F': '付款失败',
              'PRT_ITEM_OR': '改变菜项名字',
              'PRIORITY': '优先值',
              'PRINTER': '打印机',
              'PRINT': '打印',
              'PRINT_REDIRECT':'重定向',
              'PRINT_REDIRECT_TO':'重定向至',
              'PRINT_PRIMARY': '打印中文',
              'PRINT_SECONDARY': '打印英文',
              'PRINT_STORE': '餐馆信息',
              'PRINT_ORDER_TYPE': '收据类别',
              'PRINT_CUST_INFO': '客人信息',
              'PRINT_PRICE': '餐价',
              'PRINT_PAYMENT': '总额',
              'PRINT_TIP_SUGG': '小费',
              'PRINT_COUPON': '折扣卷',
              'PRINT_PRINTTIME': '打印时间',
              'PRINT_ENLARGE_CUST_INFO': '放大客人信息',
              'PRINT_DUPLICATE': '重复打印',
              'PRINT_RECEIPT': '打印收据',
              'PRINT_ALL': '全部打印',
              'PRINT_SETUP': '打印设置',
              'PRINT_REPORT': '打印报表',
              'PRINT_TODAY_REPORT': '打印今日报表',
              'PRIVATE_NUMBER': '隐藏号码',
              'PROC_ON_TML': '请在刷卡机上完成交易',
              'PRT_PRE_PAYT': '打印预结单',
              'PRT_PRE_PAYT_NA': '无法打印预结单',
              'PRT_RCPT': '打印收据',
              'PRT_BALANCE': '打印余额',
              'PRICE_EXTRA': '加价',
              'PORT': '端口',
              'POLE_DISPLAY': '客显',
              'PRESET': '配置',
              'RECEIPT_PRINTER':'收据打印机',
              'REPORT_PD': '无法使用报告',
              'REPORT_PD_TIP': '您没有使用报告的权限，请联系经理来执行此操作',
              'REPORT_COUNT_ITEM': '统计菜单下单数量',
              'RECOVER_ORDER_CONFIRM': `您确定要恢复${d[0]}号订单吗？`,
              'RECOVER_ORDER_CONFIRM_TIP': `该订单是由 ${d[0]} 取消，原因:${d[1]}`,
              'REQUEST': '要求',
              'RECOVER_ORDER': '恢复',
              'RECEIPT': '收据',
              'REPORT': '报告',
              'REPORT_RANGE': '报告范围',
              'REPORT_DETAILS': '报告内容',
              'REASON_CUST_NO_SHOW': '客人没有来',
              'REASON_CUST_CANCEL': '客人取消订单',
              'REASON_OP_CANCEL': '职员取消订单',
              'REASON_MALICE_ORDER': '恶意订单',
              'REASON_INVALID_ORDER': '订单作废',
              'REASON_PAYMENT_ISSUE': '付款问题',
              'REPORT_INFO': '报告内容',
              'REOPEN_SETTLED_ORD': `订单 #${d[0]} 已经结账`,
              'REOPEN_SETTLED_ORD_TIP': `您要先移除此单的${d[0]}结账记录后才能修改订单`,
              'REMOVE_PAYMENT': '移除付款记录',
              'REFILL': '充值',
              'REDEMP': '取现',
              'ROUND_UP': '取整',
              'RETRY': '重试',
              'RESERVATION': '预约',
              'RPT_CC_RCPT_TIP': `#${d[0]} 订单已经用信用卡付过款($${d[1]})，需要重新打印收据吗？`,
              'RESTAURANT': '餐馆',
              'PERMISSION':'权限',
              'RSA_KEY':'RSA 私钥',
              'ROLE': '角色',
              'SALES': '销售',
              'SEARCH': '搜索',
              'SPLIT': '分单',
              'SAVE': '保存',
              'SUBTOTAL': '小计',
              'STORE_TYPE': '餐馆类型',
              'STATION': '工作站',
              'SWITCH': '切换',
              'SWITCH_TABLE': '换桌',
              'SPLIT_TABLE': '分桌',
              'SEAT': '座位',
              'SET_DISCOUNT': '设折扣',
              'STATE': '州',
              'SINGLE': '单价',
              'SAT': '周六',
              'SUN': '周日',
              'SEPARATE': '人均',
              'STATUS': '状态',
              'SECOND_PAGE': '第二页',
              'SET_DRIVER': `设定送餐司机`,
              'SELF_INPUT_PRICE': '自定价格',
              'SETTLE': '结账',
              'SET_GUEST': '设置人数',
              'SET_TABLE': '安排座位',
              'SET_TIP': '设小费',
              'SET_DEFAULT': '设为默认',
              'SET_GRATUITY': '设服务费',
              'STUFF_BANK': '虚拟钱箱',
              'SEAT': '座位',
              'SEAT_ORDER': '按位下单',
              'SORT': '整理',
              'STA_UNREG': '未激活的工作站',
              'STA_REG_F': '工作站激活失败',
              'STA_TERM_NA': '此工作站没有配置刷卡机',
              'STORE': '',
              'SECURITY': '安全',
              'SELECT_QTY': `请选择 ${d[0]} 个`,
              'SECTION': '区域',
              'STARTER': '起始',
              'STATION_RECORDS': '本站',
              'STATION.TERM.TIP': '配置信用卡刷卡器',
              'STATION.POLEDISPLAY.TIP': '配置价格显示器',
              'STATION.POLEDISPLAY.FIRSTLINE': '第一行',
              'STATION.POLEDISPLAY.SECONDLINE': '第二行',
              'SHUTDOWN': '关机',
              'STORE': '店面',
              'SORT_ITEM': '打印类别',
              'SETTING':'设置',
              'SETTING.HEAD.TITLE': 'UnitedPOS 设置',
              'SETTING.STORE.TIP': '配置 · 税率 · 工作站 · 座位',
              'SETTING.MENU.TIP': '菜单 · 排序',
              'SETTING.LANGUAGE.TIP': '文本翻译',
              'SETTING.SEAT.TIP': '座位排序 · 修改',
              'SETTING.ONLINE.TIP': '网络点餐配置',
              'SETTING.USERS.TIP': '用户权限 · 数据报表',
              'SETTING.PRINT.TIP': '打印机 · 样式控制',
              'SETTING.DATABASE.TIP': '客户数据 · 来电历史 · 地址数据',
              'SETTING.SYSTEM.TIP': '更新 · 备份 · 还原',
              'SETTING.SALES.TIP': '报表 · 礼物卡',
              'SETTING.TEMPLATE.TIP': '让单个物品拥有多项选择',
              'SETTING.EXIT.TIP': '退出设置',
              'SETTING_UPDATED': '新的设置已经保存',
              'SETTING.PRINT.CONTROL': '打印样式控制',
              'SETTING.PRINT.PRINT': '打印收据',
              'SETTING.PRINT.DOUBLE': '双份打印',
              'SETTING.AUTOCHARGE.TIP':'设置自动收取小费',
              'SETTING.ONLINE.TIP':'配置网络点餐服务器',
              'STATISTIC': '数额',
              'SENT_RPT_VIA_EMAIL': '发送报表至邮箱',
              'SUMMARY':'总计',
              'TIP': '小费',
              'TAX': '税',
              'TOTAL': '总数',
              'TIME_LINE': '时间轴',
              'TERM_REPORT': '刷卡记录',
              'TUE': '周二',
              'TAG': '标签',
              'TIMER': '定时',
              'THU': '周四',
              'TITLE': '标题',
              'SUBTITLE': '子标题',
              'SUBITEM': '子菜项',
              'ROUTE': '路由',
              'TABLE_EDITOR': '座位编辑',
              'TABLE_INFO': '座位信息',
              'TABLE_CLEAR': '清除桌子',
              'TABLE_CLEAR_F': '无法清除',
              'TABLE_SWITCH_F': '无法换桌',
              'TABLE_SWITCH': '换桌',
              'TABLE_CFM_SWITCH': '确认换桌',
              'TAX_RATE': '税率',
              'TAX_FREE': '免税',
              'TAX_CLASS': '税种',
              'TAX_GROUP': '税组',
              'TAX_BEFORE_DISC': '折扣前收税',
              'TAX_BEFORE_CREDIT': '积分前收税',
              'TEMPLATE': '模板',
              'TERM': '终端机',
              'TERM_INIT': `正在初始化 ${d[0]} ...`,
              'TERM_COMM': `正在与${d[0]}通信中...`,
              'TERM_MANUAL': `请将信用卡插入${d[0]}`,
              'TERM_ABORT': '正在取消交易...',
              'TERM_INIT_F': `${d[0]}的初始化失败`,
              'TERM_TIMEOUT': '连接超时',
              'TERM_BATCH_CLOSE': '过账确认',
              'TERM_CONFIRM_ADJUST': '确认调整',
              'TERM_VOID_SALE': '取消信用卡订单',
              'TERM_NA': '无法连接终端机',
              'TERM_BATCH_DISABLE': '过账功能被临时停用',
              'TIP_TAX_ADVICE': '税务问题请咨询会计师',
              'TIP_TAX_GROUP': '创建税组用于一次性计算多种税',
              'TIP_FOR_SMS_ALERT': '短信发送服务',
              'TIP_CALC_DISTANCE': '计算地址距离',
              'TIP_REMAIN_ITEM': `还剩余${d[0]}道菜未发送`,
              'TIP_NO_REMAIN_ITEM': '此订单已经全部打印完毕',
              'TIP_PRINT_RESULT': `已发送${d[0]}道菜到厨房`,
              'TIP_PRE_PAYT': `您确定要打印 ${d[0]}桌 的预结单吗？`,
              'TIP_FORCE_CLEAR_TABLE': `${d[0]} 正在操作 ${d[1]} 桌, 您确定要还原状态吗？`,
              'TIP_REG_STA': '必须先激活才能使用此工作站',
              'TIP_REASON': `失败原因: ${d[0]}`,
              'TIP_TABLE_CLEAR': `您确定要清除 ${d[0]}桌 的信息吗？`,
              'TIP_TABLE_CLEAR_F': `您目前还不能清除 ${d[0]}桌 的信息`,
              'TIP_PRT_RCPT': '您是否要打印收据?',
              'TIP_ORDER_SETTLED': '此订单已经结账',
              'TIP_AUTO_LOGOUT': `由于您 ${d[0]} 秒内没有进行任何操作，系统自动登出账户`,
              'TIP_CALC_CITY_REQ': '客人信息缺少城市',
              'TIP_DINE_IN_ENABLE': '若想使用此功能，请去 设置->餐馆->堂吃->座位 选择开启',
              'TIP_CLOCK_IN': '请在打卡后进行操作',
              'TIP_TABLE_MUST_EMPTY': '目标座位必须是空桌',
              'TIP_SWITCH_CFM': `您确定要将 ${d[0]} 座位 转移到 ${d[1]} 座位吗?`,
              'TIP_SELECT_TABLE': '请选择一个空座完成换桌服务',
              'TIP_PRT_SPOOLER': `原计划 ${d[0]} 打印(${d[1]}之后)，您确定要立刻打印吗？`,
              'TIP_EXIT_CFM': '未保存的订单将会被删除',
              'TIP_CASH_OUT': `请确定客户要将所有现金($${d[0]})取出`,
              'TIP_WITHDRAW': `请从钱机中取出上述现金给予客人`,
              'TIP_TERM_TIMEOUT': `请检查终端机IP地址(设定IP: ${d[0]})`,
              'TIP_TERM_BATCH_CLOSE': '请您确认已经输入所有订单上的小费',
              'TIP_TERM_ADJUST_TIP': `小费将修改成 $${d[0]}, 总数:$${d[1]}`,
              'TIP_SAVE_CONFIG': '您已经做出更改，请点击保存更改设置',
              'TIP_CHARGE_BACK': '存在赖账的风险',
              'TIP_TERM_VOID_SALE': `同时也会移除 ${d[0]}号 订单的付款记录`,
              'TIP_CLOCK_IN': `您的打卡时间 ${d[0]} `,
              'TIP_CLOCK_OUT': `您打卡于 ${d[0]}, 总共工作时间: ${d[1]}`,
              'TIP_CLOCK_IN_REQ': '请在打卡后进行操作',
              'TIP_PD_ACCESS': '您没有执行此操作的权限，请联系经理',
              'TIME_CARD': '打卡',
              'TABLE_LAYOUT': '座位',
              'TIME_ZONE': '时区',
              'THIRD_PAGE': '第三页',
              'TUTORIAL': '教程',
              'TAX_CALC': '税率计算',
              'TERMINAL': '信用卡',
              'ORDER_SETTLED': '订单已结账',
              'OPEN_CD': '开钱箱',
              'OPEN_CD_PRT': '开钱箱并打印',
              'ONLINE_ORDER': '网络订单',
              'ORD_TYP_SW': `订单将从 ${d[0]} 变成 ${d[1]}`,
              'OP_LIST': '用户列表',
              'OP': '用户',
              'OPTION':'选项',
              'OPERATOR.PERMISSION.TIP':'设置用户权限',
              'OPERATOR.TIMECARD.TIP':'员工打卡记录',
              'UNVOID_ORDER_CONFIRM': '您确定要恢复已经被取消的订单吗？',
              'UNAVOIDABLE_PREVS_ORDER': '无法修改此订单',
              'UNAVOIDABLE_PREVS_ORDER_TIP': '您无法修改除今天以外的订单',
              'UNABLE_ACCESS': '无法打开',
              'VOID_ORDER_CONFIRM': `取消 #${d[0]} ${d[1]}订单`,
              'VOID_ORDER_CONFIRM_TIP': '取消之后将无法修改订单内容',
              'VOID_SETTLED_ORD': '订单已结账',
              'VOID_SETTLED_ORD_TIP': `您必须先移除该订单的${d[0]}付款信息才能取消订单`,
              'VOID_ORDER_PD': '无法删除订单',
              'VOID_ORDER_PD_TIP': '您没有删除订单的权限，请联系经理来执行此操作',
              'VOID_REASON': '订单取消原因',
              'VOID': '作废',
              'VIEW':'查看',
              'VIEW_LIST': '列表',
              'UI': '界面',
              'SYSTEM': '系统',
              'UNABLE_SEND': '发送失败',
              'UNPAID_INVOICE': '未付订单',
              'US_EN': '英文',
              'QTY': '数量',
              'WALK_IN': '外等',
              'WALK_IN_INVOICE': '外等订单',
              'WEN': '周三',
              'WHITE': '白人',
              'WITHDRAW': `现金 $ ${d[0]}`,
              'WAIT_QUEUE': '等待队列',
              'WEIGHT_SCALE': '磅秤',
              'ZIP_CODE': '邮区',
              'ZH_CN': '中文'
            },
            usEN: {
              'INITIALIZING': 'Initailizing...',
              'LOOKING_FOR_HOST': 'Looking for server...',
              'HOST_CONNECTED': 'Server Connected...',
              'CONNECT_DATABASE_FAILED': 'Connect Database Failed.',
              'LOADING_CONFIG': 'Loading Config...',
              'LOADING_CONTENT': 'Loading Data...',
              'PASSWORD_INCORRECT': 'Password Incorrect',
              'WALK_IN': 'Walk In',
              'PICK_UP': 'Pick Up',
              'DELIVERY': 'Delievry',
              'DINE_IN': 'Dine In',
              'PHONE': 'Phone',
              'EXTENSION': 'Extension',
              'NAME': 'Name',
              'ADDRESS': 'Address',
              'CITY': 'City',
              'NOTE': 'Note',
              'TAG': 'Tag',
              'CANCEL': 'Cancel',
              'CREATE': 'Create',
              'LESS': 'Less',
              'MORE': 'More',
              'MODIFY': 'Modify',
              'TIMER': 'Timer',
              'PAYMENT': 'Payment',
              'PRINT': 'Print',
              'SEARCH': 'Search',
              'SPLIT': 'Split',
              'SAVE': 'Save',
              'REQUEST': 'Request',
              'EXIT': 'Exit',
              'SUBTOTAL': 'Subtotal',
              'TAX': 'Tax',
              'DELIVERY_FEE': 'Delivery',
              'TOTAL': 'Total',
              'DISCOUNT': 'Discount',
              'PHONE_REQUIRED': 'Phone Required',
              'SWITCH': 'Switch',
              'SWITCH_TABLE': 'Switch',
              'COMBINE_TABLE': 'Combine',
              'SPLIT_TABLE': 'Split Table',
              'SEAT': 'Seat',
              'NEW_ORDER': 'NEW Order',
              'PLACE_ORDER': 'Place Order',
              'EDIT_ORDER': 'Edit',
              'DEL_ORDER': 'Void',
              'RECOVER_ORDER': 'Reopen',
              'RECEIPT': 'Receipt',
              'STATUS': 'Status',
              'ARRANGE': 'Arrange',
              'LAYOUT': 'Layout',
              'SETTLE': 'Settle',
              'TIP': 'Tip',
              'GRATUITY': 'Gratuity',
              'TIME_LINE': 'Time Line',
              'ORDER': 'Order',
              'SET_TABLE': 'Set Table',
              'SET_GUEST': 'Set Guest',
              'CONFIRM': 'Confirm',
              'CANCEL': 'Cancel',
              'PICK_COLOR': 'Pick Color',
              'ASSIGN_WAITER': 'Assign Waiter',
              'ASSIGN': 'Assign',
              'COURSE_TIME': 'Course Time',
              'MARKER': 'Marker',
              'REQUEST': 'Request',
              'ORDER_SPLIT': 'Split Order',
              'CASH': 'Cash',
              'DEBET': 'Debet',
              'CREDIT': 'Credit',
              'LOYALTY': 'Loyalty',
              'SINGLE': 'Single',
              'QTY': 'Qty',
              'DISCOUNT': 'Discount',
              'CLEAR': 'Clear',
              'ITEM': 'Item',
              'PRICE': 'Price',
              'NEXT_PAGE': 'Next Page',
              'PREV_PAGE': 'Previous Page',
              'EXIT_CONFIRM': 'Confirm to Exit?',
              'EXIT_CONFIRM_TIP': 'Exit the order without saving changes?',
              'VOID_ORDER_CONFIRM': `Cancel #${d[0]} ${d[1]}order`,
              'VOID_ORDER_CONFIRM_TIP': 'The order cannot be modified after cancellation',
              'UNVOID_ORDER_CONFIRM': 'Are you sure to reopen voided order?',
              'UNVOIDABLE_PREVS_ORDER': 'This order cannot be modified',
              'UNVOIDABLE_PREVS_ORDER_TIP': 'You cannot modify any orders than today',
              'NO_PREVS_ORDER': 'Cannot find the order',
              'NO_PREVS_ORDER_TIP': 'Cannot find any order, display today`s order by default',
              'CANT_EDIT_VOIDED_ORDER': 'Cannot edit voided order',
              'CANT_EDIT_VOIDED_ORDER_TIP': `This order has been cancelled by ${d[0]}，please reopen order for further operations.`,
              'RECOVER_ORDER_CONFIRM': `Are you sure to reopen ${d[0]}?`,
              'RECOVER_ORDER_CONFIRM_TIP': `This order has been cancelled by ${d[0]}, reason:${d[1]}`,
              'POS_MAINTENANCE': 'System is under maintenance',
              'POS_MAINTENANCE_TIP': 'Thanks for your patience, we will get it right away!',
              //PD = PERMISSION DENIED
              'VOID_ORDER_PD': 'Order cannot be voided.',
              'VOID_ORDER_PD_TIP': 'You do not have right to do this, please contact the manager.',
              'DRAWER_OPEN_PD': 'Cannot open cash drawer.',
              'DRAWER_OPEN_PD_TIP': ' You do not have right to open cash drawer, please contact the manager.',
              'REPORT_PD': 'Unable to use report.',
              'REPORT_PD_TIP': 'You do not have right to use report, contact the manager.',
              'INVOICE': 'Invoice',
              'ALL_INVOICE': 'All Invoice',
              'WALK_IN_INVOICE': 'Walk In',
              'PICK_UP_INVOICE': 'Pick Up',
              'DELIVERY_INVOICE': 'Delivery',
              'DINE_IN_INVOICE': 'Dine In',
              'UNPAID_INVOICE': 'Unpaid',
              'BY_CALENDAR': 'Calendar',
              'BY_CASHIER': 'Cashier',
              'BY_DRIVER': 'Driver',
              'REPORT': 'Report',
              'VOID_REASON': 'Void reason',
              'REASON_CUST_NO_SHOW': 'Customer no show.',
              'REASON_CUST_CANCEL': 'Invoice cancelled by customer.',
              'REASON_OP_CANCEL': 'Order cancelled by employee.',
              'REASON_MALICE_ORDER': 'Order cancelled maliciously. ',
              'REASON_INVALID_ORDER': 'Invalid order',
              'REASON_PAYMENT_ISSUE': 'Payment issue',
              'MON': 'Monday',
              'TUE': 'Tuesday',
              'WEN': 'Wednesday',
              'THU': 'Thursday',
              'FRI': 'Friday',
              'SAT': 'Saturday',
              'SUN': 'Sunday',
              'NEW_REPORT': 'New Report',
              'PRINT_REPORT': 'Print Report',
              'REPORT_INFO': 'Report information',
              'SET_DRIVER': `Select a delivery driver.`,
              'SELF_INPUT_PRICE': 'Input price',
              'PRIVATE_NUMBER': 'Private number',
              'PRINT_TODAY_REPORT': 'Print Today Report',
              'FIRST_PAGE': 'Page One',
              'SECOND_PAGE': 'Page Two',
              'THIRD_PAGE': 'Page Three',
              'CHANGE_DUE': 'Change',
              'CONFIRM_RPT_CC_RCPT': 'Print Credit Card Receipt',
              'RPT_CC_RCPT_TIP': `#${d[0]} Invoice has been paid by Credit Card($${d[1]}), reprint credit card receipt?`,
              'REOPEN_SETTLED_ORD': `Invoice #${d[0]} has closed`,
              'REOPEN_SETTLED_ORD_TIP': `You need to remove ${d[0]} Payment record before you can modify`,
              'BALANCE_DUE': 'Balance Due',
              'BALANCE_REMAIN': 'Balance Remain',
              'PROC_ON_TML': 'Please follow instruction on the terminal',
              'CC_DUP_TRANS': 'Transaction Failed: Credit Card duplicate',
              'CC_BAD_TRACK': 'Transaction Failed: Can not read Credit Card Information',
              'CC_TRANS_ABORT': 'Transaction Abort',
              'CC_EXP_INVALID': 'Transaction Failed: Expiration Date incorrect',
              'CC_DECLINED': 'Credit Card Declined',
              'TERM_REPORT': 'Terminal Report',
              'CC_TIMEOUT': 'Transaction Failed: Time out',
              'CC_COMM_ERROR': 'Transaction Failed: Please check your internet',
              'CC_UNKNOWN': 'Transaction Failed: An unknown error occurred',
              'SEPARATE': 'Average Paid',
              'CC_NUMBER': 'Credit Card',
              'CC_EXP': 'Exp',
              'CVV': 'CVV',
              'SET_DISCOUNT': 'Set Discount',
              'STATE': 'State',
              'ZIP_CODE': 'Zip Code',
              'CONTACT': 'Contact',
              'E_MAIL': 'Email',
              'STORE_TYPE': 'Store Type',
              'STATION': 'Station',
              'TIME_ZONE': 'Time Zone',
              'AREA': 'Area',
              'BASIC_INFO': 'Basic Info',
              'ITEM_EDITOR': 'Item Editor',
              'CODE_EDITOR': 'Code Editor',
              'ZH_CN': 'Pri Lang',
              'US_EN': 'Sec Lang',
              'MENU_ID': 'Menu ID',
              'ITEM_INFO': 'Item Info',
              'PRINT_SETUP': 'Print Setup',
              'SORT': 'Sort',
              'IS_SPICY': 'Spicy',
              'TAX_CALC': 'Tax Calc.',
              'CATEGORY': 'Cate.(Sec)',
              'CATEGORY_CN': 'Cate.(Pri)',
              'ITEM_SIDE': 'Side Item',
              'ADD_SIDE': 'Add Side',
              'MAX_ITEM': `Max ${d[0]}`,
              'EDIT': 'Edit',
              'GET_PIN': 'PIN',
              'DELETE': 'Del.',
              'OP_LIST': 'User List',
              'OP': 'Operator',
              'ROLE': 'Role',
              'ACTION': 'Actions',
              'CATE_EDITOR': 'Category Editor',
              'RESERVATION': 'Reservation',
              'DINE_IN_DISABLED': 'Dine In Function DISABLED',
              'TABLE_LAYOUT': 'Table',
              'STUFF_BANK': 'Stuff Bank',
              'GUEST_COUNT': 'Guest Count',
              'SEAT_ORDER': 'Seat Order',
              'ALIES': 'Alies',
              'APPLY': 'Apply',
              'PRICE_EXTRA': 'Extra Price',
              'CUST_INFO': 'Cust. Info',
              'REMOVE_PAYMENT': 'Remove Payment',
              'PRIORITY': 'Priority',
              'INVALID_VALUE': `${d[0]} has Invalid Value`,
              'EXTRA': 'Extra',
              'DYN_CHRG': 'Dynamic Charge',
              'MILE_COST': 'Mile/Cost',
              'CAL_DIST': 'Calc. Distance',
              'CALL_LOG': 'Call Log',
              'GIFT_CARD': 'Gift Card',
              'PRT_ITEM_OR': 'Diff. Item Name',
              'HISTORY': 'History',
              'CONFIRM_ORD_TYP_SW': 'Confirm Change',
              'ORD_TYP_SW': `Invoice will become ${d[1]} from ${d[0]}`,
              'DEL_ITEM_CONFIRM': 'Delete',
              'DEL_ITEM_TIP': `Are you sure to remove ${d[0]} from the item list?`,
              'CONTAIN': 'Contain',
              'REFILL': 'Refill',
              'ACTIVATION': 'Activation',
              'ISSUE_GC': 'Issue',
              //GIFT CARD
              'GC_SWIPE': 'Please Swipe Gift Card',
              'GC_ACTIVATION': 'Gift Card Activation',
              'GC_CARD_NUMBER': `For Gift Card (${d[0]})`,

              //PAYMENT
              'PYMT_F': 'Payment Failed',

              //SET
              'SET_GUEST': 'Set Guests',
              'SET_TABLE': 'Set Table',
              'SET_TIP': 'Set Tip',
              'SET_GRATUITY': 'Set Gratuity',
              //STATION
              'STA_UNREG': 'This Station needs activation',
              'STA_REG_F': 'Station activation failed',
              'STA_TERM_NA': 'This Station does not equip a Terminal',



              //OTHER TEXT
              'LOGOUT': 'Log Out',
              'LANGUAGE': '语言',
              'AUTO_LOGOUT': 'Auto Logout',
              'ENABLE': 'Enable',
              'MODEL': 'Model',
              'PORT': 'Port',
              'MAC': 'Mac',
              'WAIT_QUEUE': 'Wait Queue',
              'DONE': 'Done',
              'HOLD': 'HOld',
              'CUST_SEAT': 'Cust. Seat',
              'LACK_INFO': 'Info needed',
              'CLEAR': 'Clear',
              'ITEM_SEND': 'Item send',
              'UNABLE_SEND': 'Unable send',
              'FORCE_CLEAR': 'Force Clear',
              'RETRY': 'Retry',
              'ORDER_SETTLED': 'Order has settled',
              'TIMEOUT': 'Timeout',
              'ONLINE_ORDER': 'Online Order',
              'SECURITY': 'Security',
              'ACCOUNT': 'Account',
              'PASSWORD': 'Password',
              'DELIVERY_FREE': 'Free Delivery',
              'PD_ACCESS': 'Unable Access',
              'SECTION': 'Section',
              'ICON': 'Icon',
              'EXTEND': 'Extend',
              'MAP_API': 'Map API',
              'DP_CATEGORY': 'Display Category',
              'ITEM_BUILDER': 'Item Builder',
              'SELECT_QTY': `Choose up to ${d[0]}`,
              'ANY_QTY': 'Multiple Choice',
              'STARTER': 'Starter',
              'APPERTIZER': 'Appetizer',
              'ENTREE': 'Entree',
              'DESSERT': 'Dessert',
              'TIME_CARD': 'Time Card',
              'EMPLOYEE': 'Employee',
              'CLOCK_IN_REQ': 'Clock In Required',
              'ITEM_PENDING': `${d[0]} Items in queue`,
              'PRT_CFM': 'Print Confirm',
              'EXIT_CFM': 'Confirm EXIT',
              'AUTO_ADD': 'Disable Auto Add',
              'ADD_VALUE': 'Add Value',
              'REDEMP': 'Redemp.',
              'ROUND_UP': 'Round',
              'OPEN_CD': 'Open Drawer',
              'OPEN_CD_PRT': 'Open & Print',
              'CHANGE': `Change $${d[0]}`,
              'CUST_PAID': `Customer Paid You $${d[0]}`,
              'INIT_AMOUNT': 'Initial Amount',
              'ALL_RECORDS': 'All Records',
              'BATCH': 'Batch',
              'TERMINAL': 'Terminal',
              'STATION_RECORDS': 'Station',
              'SHUTDOWN': 'Shutdown',
              'SETTING_UPDATED': 'Setting updated',
              'CONTINUTE': 'Continute',
              'ADJUST_TIP': 'ADJUST',
              'CHECKSUM': 'Check',
              'CONFIRM&PRINT': 'Confirm & Print',
              //TABLE
              'TABLE_EDITOR': 'Table Editor',
              'TABLE_INFO': 'Table Info',
              'TABLE_CLEAR': 'Clear Table',
              'TABLE_CLEAR_F': 'Unable Reset Table',
              //TAX
              'TAX_RATE': 'Tax Rate',
              'TAX_FREE': 'Tax Free',
              'TAX_CLASS': 'Tax Class',
              'TAX_GROUP': 'Tax Group',
              //TERMINAL
              'TERM': 'Terminal',
              'TERM_INIT': `${d[0]} Initializing...`,
              'TERM_COMM': `Communicating with ${d[0]}...`,
              'TERM_MANUAL': `Please Insert Credit Card into ${d[0]}`,
              'TERM_ABORT': 'Aborting...',
              'TERM_INIT_F': `${d[0]} initialization failed`,
              'TERM_TIMEOUT': 'TERMINAL CONNECTION TIMEOUT',
              'TERM_BATCH_CLOSE': 'BATCH CLOSE CONFIRM',
              'TERM_CONFIRM_ADJUST': 'Tip Adjust Confirm',
              //TIP
              'TIP_TAX_ADVICE': 'Please consult with your accountant',
              'TIP_TAX_GROUP': '创建税组用于一次性计算多种税',
              'TIP_FOR_SMS_ALERT': '短信发送服务',
              'TIP_FOR_DIST_CALC': '计算地址距离',
              'TIP_REMAIN_ITEM': `还剩余${d[0]}道菜未发送`,
              'TIP_NO_REMAIN_ITEM': '此订单已经全部打印完毕',
              'TIP_PRINT_RESULT': `已发送${d[0]}道菜到厨房`,
              'TIP_PRE_PAYT': `您确定要打印 ${d[0]}桌 的预结单吗？`,
              'TIP_FORCE_CLEAR_TABLE': `${d[0]} 正在操作 ${d[1]} 桌, 您确定要还原状态吗？`,
              'TIP_REG_STA': 'You must activate this station before you can use it',
              'TIP_REASON': `Failed Reason: ${d[0]}`,
              'TIP_TABLE_CLEAR': `您确定要清除 ${d[0]}桌 的信息吗？`,
              'TIP_TABLE_CLEAR_F': `您目前还不能清除 ${d[0]}桌 的信息`,
              'TIP_PRT_RCPT': 'Do you want to print Receipt?',
              'TIP_ORDER_SETTLED': 'This Invoice has settled',
              'TIP_AUTO_LOGOUT': `You have been logout due to no action in ${d[0]} seconds`,
              'TIP_CALC_CITY_REQ': 'City field required',
              'TIP_DINE_IN_ENABLE': 'If you wish to enable, please goto Setting->Restaurant->Dine In->Seat toggle switch',
              'TIP_CLOCK_IN': 'If you wish to Clock In please goto top bar -> Clock In',
              'TIP_PRT_SPOOLER': `It was scheduled at ${d[0]} (${d[1]} Later). Are you sure to print it RIGHT NOW?`,
              'TIP_EXIT_CFM': 'Unsave order item will be removed',
              'TIP_CASH_OUT': `Please confirm that customer wants to take all the cash ($${d[0]}) out`,
              'TIP_WITHDRAW': `Please withdraw the cash from the cash drawer`,
              'TIP_TERM_TIMEOUT': `Please check your Terminal IP address (Expecting IP:${d[0]})`,
              'TIP_TERM_BATCH_CLOSE': 'Please make you that you have entered all the tip',
              'TIP_TERM_ADJUST_TIP': `Please confirm to add tip $${d[0]}, total: $${d[1]}`,
              'TIP_SAVE_CONFIG': 'Remember to save before you leave',
              'TIP_CHARGE_BACK': 'There is a chargeback risk',
              //PRINT
              'PRT_PRE_PAYT': 'Print PrePayment',
              'PRT_PRE_PAYT_NA': 'Unable to print PrePayment',
              'PRT_RCPT': 'Print Receipt',
              'PRT_BALANCE': 'Print Bal.'
            }
          }
          return dict[Vue.language][text.toUpperCase()] || text;
        }
      }
    });
    Vue.prototype.$setLanguage = function (language) {
      Vue.language = language;
    }
  }
}
export default i18n;
