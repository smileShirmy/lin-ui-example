import Schema from '../common/async-validator/index';
/**
 * @param tipType String [toast , message , text]
 */
// eslint-disable-next-line no-undef
export default Behavior({
  behaviors: [],
  properties: {
    // 校验
    rules: {
      type: [Object,Array],
      value: []
    },
    tipType: {
      type: String,
      value:'toast'
    }
  },
  data: {
    schema: '',
    tipFun: {
      'message': 'showMessage',
      'toast': 'showToast',
    },
    tipContent: {
      'message': 'content',
      'toast': 'title',
    },
    errorText: '',
    errors: []
  },

  methods: {
    initRules() {
      // const rulesName = this.data.name;
      const {
        rules
      } = this.data;
      if (!rules) return;
      // 如果rule 是单个object
      if(Object.prototype.toString.call(rules) === '[object Object]') {
        this.data.rules = [rules];
      }

      this.data.rules.forEach(item => {
        if(!item.trigger) {
          item.trigger = [];
          return;
        }
        if(typeof item.trigger === 'string') {
          item.trigger = [item.trigger];
          return;
        }
        // if(Object.prototype.toString.call(item.trigger) === '[object Object]') {
        //   item.trigger = ['blur'];
        //   return;
        // }
      })

    },
    getNeedValidateRule(type) {
      const rulesName = this.data.name;
      const {
        rules
      } = this.data;
      if (!rules) return;

      const list = type ? rules.filter(item => {
        return item.trigger.indexOf(type) > -1;
      }): rules;
      const schema = new Schema({
        [rulesName]: list,
      });
      this.setData({
        schema,
      });
      return list;
    },
    validatorData(value, type) {
      const {
        tipType,
        tipFun,
        tipContent
      } = this.data;
      const rules = this.getNeedValidateRule(type);

      if (!rules) return;

      this.data.schema.validate(value, (errors) => {
        this.setData({
          errors: errors || []
        });

        this.triggerEvent('linvalidate', {
          errors,
          isError: !!errors
        });

        if (errors && tipType) {
          const funName = tipFun[tipType];
          const contentName = tipContent[tipType];
          if (tipType === 'text') {
            this.setData({
              errorText: errors[0].message
            });
            return errors;
          }

          if (!wx.lin || !wx.lin[funName]) {
            wx.showToast({
              icon: 'none',
              title: `请在页面内引入${tipType}组件`
            });
            return errors;
          }

          wx.lin[funName] && wx.lin[funName]({
            [contentName]: errors[0].message,
            duration: 1500,
            mask: false,
          });
          return errors;
        } else if (!errors && tipType) {
          this.setData({
            errorText: ''
          });
        }

      });

    }
  }
});
