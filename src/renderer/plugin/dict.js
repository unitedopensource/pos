import locales from './locales'

const dict = {
    install(Vue, options) {
        Vue.language = 'us-en';
        Vue.locales = locales[Vue.language];
        Vue.mixin({
            methods: {
                text(text, ...d) {
                    return text.split('.').reduce((p, c) => p && p[c] || c, Vue.locales);
                },
                $t(text, ...d) {
                    //d[0] && typeof d[0] === 'object'
                    return text.split('.').reduce((p, c) => p && p[c] || c, Vue.locales);
                }
            }
        })

        Vue.prototype.$setLanguage = function (language) {
            switch (language) {
                case 'usEN':
                case 'us-en':
                case 'en':
                    Vue.language = 'us-en';
                    break;
                case "zhCN":
                case "zh-cn":
                case "cn":
                    Vue.language = 'zh-cn';
                    break;
            }
            Vue.locales = locales[Vue.language]
        }
    }
}

export default dict;