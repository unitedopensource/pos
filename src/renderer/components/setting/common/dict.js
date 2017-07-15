var Dictionary = function (key) {
    let abbreviation = {
        ER: [{ zhCN: "春卷", usEN: "Egg Roll" }],
        SR: [{ zhCN: "虾卷", usEN: "Shrimp Roll" }, { zhCN: "上海卷", usEN: "Spring Roll" }, { zhCN: "排骨", usEN: "B.B.Q. Spare Ribs" }, { zhCN: "无排骨", usEN: "Boneless Spare Ribs" }],
        CSR: [{ zhCN: "牛卷", usEN: "Cheese Steak Roll" }],
        FW: [{ zhCN: "炸云吞", usEN: "Fried Wonton" }],
        CR: [{ zhCN: "蟹角", usEN: "Crab Rangoon" }],
        DP: [{ zhCN: "水饺", usEN: "Dumpling" }],
        PU: [{ zhCN: "宝宝盘", usEN: "Egg Roll" }],
        COS: [{ zhCN: "鸡串", usEN: "Chicken On Stick" }],
        BOS: [{ zhCN: "牛串", usEN: "Beef On Stick" }],
        SOS: [{ zhCN: "虾串", usEN: "Shrimp On Stick" }],
        FD: [{ zhCN: "炸包", usEN: "Fried Donut" }],
        SRT: [{ zhCN: "排骨尾", usEN: "Spare Rib tips" }],

        WTS: [{ zhCN: "云吞汤", usEN: "Wonton Soup" }],
        EDS: [{ zhCN: "蛋花汤", usEN: "Egg Drop Soup" }],
        WTEDS: [{ zhCN: "云吞蛋花汤", usEN: "Wonton Egg Drop Soup" }],
        VS: [{ zhCN: "杂菜汤", usEN: "Mixed Veg. Soup" }],
        CNS: [{ zhCN: "鸡面汤", usEN: "Chicken Noodle Soup" }],
        CRS: [{ zhCN: "鸡饭汤", usEN: "Chicken Rice Soup" }],
        SS: [{ zhCN: "海鲜汤", usEN: "Seafood Soup" }],
        HSS: [{ zhCN: "本楼汤", usEN: "House Special Soup" }],

        VCM: [{ zhCN: "菜炒面", usEN: "Veg. Chow Mein" }],
        CCM: [{ zhCN: "鸡炒面", usEN: "Chicken Chow Mein" }],
        PCM: [{ zhCN: "叉烧炒面", usEN: "Pork Chow Mein" }],
        SCM: [{ zhCN: "虾炒面", usEN: "Shrimp Chow Mein" }, { zhCN: "海鲜炒面", usEN: "Seafood Chow Mein" }],
        BCM: [{ zhCN: "牛炒面", usEN: "Beef Chow Mein" }],
        HSCM: [{ zhCN: "本楼炒面", usEN: "House Chow Mein" }],

        VCS: [{ zhCN: "菜杂碎", usEN: "Veg. Chop Suey" }],
        CCS: [{ zhCN: "鸡杂碎", usEN: "Chicken Chop Suey" }],
        PCS: [{ zhCN: "叉烧杂碎", usEN: "Pork Chop Suey" }],
        SCS: [{ zhCN: "虾杂碎", usEN: "Shrimp Chop Suey" }, { zhCN: "海鲜杂碎", usEN: "Shrimp Chop Suey" }],
        BCS: [{ zhCN: "牛杂碎", usEN: "Beef Chop Suey" }],
        HSCS: [{ zhCN: "本楼杂碎", usEN: "House Special Chop Suey" }],

        VLM: [{ zhCN: "菜捞面", usEN: "Vege. Lo Mein" }],
        CLM: [{ zhCN: "鸡捞面", usEN: "Chicken Lo Mein" }],
        PLM: [{ zhCN: "叉烧捞面", usEN: "Pork Lo Mein" }, { zhCN: "净捞面", usEN: "Plain Lo Mein" }],
        SLM: [{ zhCN: "虾捞面", usEN: "shrimp Lo Mein" }],
        BLM: [{ zhCN: "牛捞面", usEN: "Beef Lo Mein" }],
        HSLM: [{ zhCN: "本楼捞面", usEN: "House Special Lo Mein" }],

        VMF: [{ zhCN: "菜米粉", usEN: "Vegetable Mei Fun" }],
        CMF: [{ zhCN: "鸡米粉", usEN: "Chicken Mei Fun" }],
        PMF: [{ zhCN: "叉烧米粉", usEN: "Pork Mei Fun" }],
        SMF: [{ zhCN: "虾米粉", usEN: "Shrimp Mei Fun" }, { zhCN: "海鲜米粉", usEN: "Seafood Mei Fun" }, { zhCN: "星州米粉", usEN: "Singapore Mei Fun" }],
        BMF: [{ zhCN: "牛米粉", usEN: "Beef Mei Fun" }],
        HSMF: [{ zhCN: "本楼米粉", usEN: "House Special Mei Fun" }],

        FR: [{ zhCN: "炒饭", usEN: "Fried Rice" }],
        BR: [{ zhCN: "黑饭", usEN: "Brown Rice" }],
        VFR: [{ zhCN: "菜炒饭", usEN: "Veg Fried Rice" }],
        CFR: [{ zhCN: "鸡炒饭", usEN: "Chicken Fried Rice" }],
        PFR: [{ zhCN: "叉烧饭", usEN: "Pork Fried Rice" }, { zhCN: "净炒饭", usEN: "Plain Fried Roll" }],
        SFR: [{ zhCN: "虾炒饭", usEN: "Shrimp Fried Rice" }, { zhCN: "海鲜炒饭", usEN: "Seafood Fried Rice" }],
        LFR: [{ zhCN: "龙虾炒饭", usEN: "Lobster Fried Rice" }],
        HSFR: [{ zhCN: "本楼炒饭", usEN: "House Special Fried Rice" }],
        CMFR: [{ zhCN: "蟹肉炒饭", usEN: "Crab Meat Fried Rice" }],
        HFM: [{ zhCN: "肉炒饭", usEN: "Ham Fried Rice" }],

        PSO: [{ zhCN: "青椒牛", usEN: "Pepper Steak w.Onion" }],
        BMV: [{ zhCN: "杂菜牛", usEN: "Beef w.Mixed Veg." }],
        BM: [{ zhCN: "蘑菇牛", usEN: "Beef w.Mushroom" }],
        BSP: [{ zhCN: "雪豆牛", usEN: "Beef w.Snow Peas" }],
        BB: [{ zhCN: "芥兰牛", usEN: "Beef Broccoli" }],
        BCS: [{ zhCN: "咖喱牛", usEN: "Beef w.Curry Sauce", spicy: true }],
        BSS: [{ zhCN: "四川牛", usEN: "Beef w.Szechuan Style", spicy: true }],
        BGS: [{ zhCN: "鱼香牛", usEN: "Beef w.Garlic Sauce", spicy: true }],
        BHS: [{ zhCN: "湖南牛", usEN: "Beef w.Hunan Style", spicy: true }],
        HSB: [{ zhCN: "干烧牛", usEN: "Hot & Spicy Beef", spicy: true }],
        MB: [{ zhCN: "蒙古牛", usEN: "Mongolian Beef" }],

        PB: [{ zhCN: "芥兰叉烧", usEN: "Pork Broccoli" }],
        PMV: [{ zhCN: "杂菜叉烧", usEN: "Pork w.Mixed Vege." }],
        PM: [{ zhCN: "蘑菇叉烧", usEN: "Pork w.Mushroom" }],
        PSP: [{ zhCN: "雪豆叉烧", usEN: "Pork w.Sonw Peas" }],
        PHS: [{ zhCN: "湖南叉烧", usEN: "Pork w.Hunan Style", spicy: true }],
        PZS: [{ zhCN: "四川叉烧", usEN: "Pork w.Szechuan Style", spicy: true }],

        MGGP: [{ zhCN: "蘑菇鸡片", usEN: "Moo Goo Gai Pan" }],
        CB: [{ zhCN: "芥兰鸡", usEN: "Chicken Broccoli" }],
        CSP: [{ zhCN: "雪豆鸡", usEN: "Chicken w.Snow Peas" }],
        CMV: [{ zhCN: "杂菜鸡", usEN: "Chiken w.Mixed Vege." }],
        CCN: [{ zhCN: "腰果鸡", usEN: "Chicken w.Cashew Nuts" }],
        PCO: [{ zhCN: "青椒鸡", usEN: "Pepper Chicken w.Onion" }],
        CCS: [{ zhCN: "咖喱鸡", usEN: "Chicken w.Curry Sauce", spicy: true }],
        CGS: [{ zhCN: "鱼香鸡", usEN: "Chicken w.Garlic Sauce", spicy: true }],
        KPC: [{ zhCN: "宫保鸡", usEN: "Kong Pao Chicken" }],
        CHS: [{ zhCN: "湖南鸡", usEN: "Chicken w.Hunan Style", spicy: true }],
        HSC: [{ zhCN: "干烧鸡", usEN: "Hot & Spicy Chicken", spicy: true }],
        CSS: [{ zhCN: "四川鸡", usEN: "Chicken w.Szechuan Style", spicy: true }],

        SB: [{ zhCN: "芥兰虾", usEN: "Shrimp Broccoli" }, { zhCN: "炒芥兰", usEN: "Sauteed Broccoli" }],
        SM: [{ zhCN: "蘑菇虾", usEN: "Shrimp w.Mushroom" }],
        SSP: [{ zhCN: "雪豆虾", usEN: "Shrimp w.Snow Peas" }],
        SCS: [{ zhCN: "咖喱虾", usEN: "Shrimp w.Curry Sauce" }],
        SLS: [{ zhCN: "虾龙湖", usEN: "Shrimp w.Lobster Sauce" }],
        SHS: [{ zhCN: "湖南虾", usEN: "Shrimp w.Hunan Style" }],
        SGS: [{ zhCN: "鱼香虾", usEN: "Shrimp w.Galice Sauce", spicy: true }],
        KPS: [{ zhCN: "宫保虾", usEN: "Kong Pao Shrimp" }],
        SCN: [{ zhCN: "腰果虾", usEN: "Shrimp w.Cashew Nuts" }],

        TD: [{ zhCN: "炒三样", usEN: "Triple Delight" }],
        ST: [{ zhCN: "海鲜三样", usEN: "Seafood Triple Delight" }],
        HTD: [{ zhCN: "湖南三样", usEN: "Hunan Triple Delight" }],

        SMV: [{ zhCN: "炒杂菜", usEN: "Sauteed Mixed Vegs." }, { zhCN: "水煮杂菜", usEN: "Steamed Mixed Veg." }],
        SCB: [{ zhCN: "水煮芥兰鸡", usEN: "Steamed Chicken Broccoli" }],
        SSB: [{ zhCN: "水煮芥兰虾", usEN: "Steamed Shrimp Broccoli" }],

        PEFY: [{ zhCN: "叉烧蓉蛋", usEN: "Pork Egg Foo Young" }],
        CEFY: [{ zhCN: "鸡蓉蛋", usEN: "Chicken Egg Foo Young" }],
        SEFY: [{ zhCN: "虾蓉蛋", usEN: "Shrimp Egg Foo Young" }],
        BEFY: [{ zhCN: "牛蓉蛋", usEN: "Beef Egg Foo Young" }],
        HEFY: [{ zhCN: "本楼蓉蛋", usEN: "House Egg Foo Young" }],

        SSP: [{ zhCN: "甜酸肉", usEN: "Sweet & Sour Pork" }],
        SSC: [{ zhCN: "甜酸鸡", usEN: "Sweet & Sour Chicken" }],
        SSS: [{ zhCN: "甜酸虾", usEN: "Sweet & Sour Shrimp" }],

        HF: [{ zhCN: "全家福", usEN: "Happy Family" }],
        DP: [{ zhCN: "龙凤配", usEN: "Dragon & Phoenix" }],
        GTC: [{ zhCN: "左宗鸡", usEN: "General Taso's Chk", spicy: true }],
        GTS: [{ zhCN: "左宗虾", usEN: "General Taso's Shrp", spicy: true }],
        SC: [{ zhCN: "芝麻鸡", usEN: "Sesame Chicken" }],

        OC: [{ zhCN: "陈皮鸡", usEN: "Orange Chicken" }],
        OS: [{ zhCN: "陈皮虾", usEN: "Orange Shrimp" }],
        OB: [{ zhCN: "陈皮牛", usEN: "Orange Beef" }],
        FS: [{ zhCN: "炒四季", usEN: "Four Season" }, { zhCN: "炸干贝", usEN: "Fried Scallop" }],

        W: [{ zhCN: "鸡翅", usEN: "Chk Wings" }],
        GW: [{ zhCN: "烤翅", usEN: "Grilled Wings" }],
        BW: [{ zhCN: "辣翅", usEN: "Bufflo Wings", spicy: true }],
        HW: [{ zhCN: "蜜翅", usEN: "Honey Wings" }],
        CN: [{ zhCN: "鸡粒", usEN: "Chicken Nuggets" }],
        JS: [{ zhCN: "炸大虾", usEN: "Jumbo Shrimp" }],
        FF: [{ zhCN: "薯条", usEN: "French Fries" }],
        FSB: [{ zhCN: "炸虾篮", usEN: "Fried Shrp Basket" }],
        FCS: [{ zhCN: "炸蟹条", usEN: "French Crab Stick" }]
    }

    let prefix = '';
    key = key.toUpperCase();
    let result = abbreviation[key];
    console.log(key)
    if (key && key.includes('L.') || key.includes('C.')) {
        prefix = key.slice(0, 2);
        key = key.substring(2);
        result.forEach(item => {
            item.usEN = prefix + item.usEN;
            item.zhCN = prefix + item.zhCN;
        })
    }
    return result || [];
};

export default Dictionary;
