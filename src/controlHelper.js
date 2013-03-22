/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 控件类常用的helper方法模块
 * @author erik
 */

define(
    function (require) {
        var lib = require('./lib');
        var ui = require('./main');
        var now = (new Date).getTime();

        /**
         * 获取LifeCycle枚举
         * 
         * @inner
         * @return {Object} 
         */
        function getLifeCycle() {
            return require('./Control').LifeCycle;
        }

        /**
         * 获取唯一id
         * 
         * @inner
         * @return {string}
         */
        function getGUID() {
            return 'esui' + now++;
        }

        /**
         * 控件类常用的helper方法模块
         * 
         * @type {Object}
         */
        var helper = {};

        /**
         * 初始化控件
         * 
         * @param {Control} control 控件实例
         * @param {Object} options 初始化参数
         */
        helper.init = function (control, options) {
            control.children = [];
            control.childrenIndex = {};
            control.states = {};
            control.events = {};
            
            options = options || {};
            control.setProperties(options);

            // 自创建id
            if (!control.id) {
                control.id = getGUID();
            }

            // 初始化视图环境
            helper.initViewContext(control);

            // 初始化扩展
            helper.initExtensions(control);
        };

        /**
         * 执行控件初始化后动作
         * 
         * @param {Control} control 控件实例
         */
        helper.afterInit = function (control) {
            control.lifeCycle = getLifeCycle().INITED;
            control.fire('init');
        };

        /**
         * 初始化控件视图环境
         * 
         * @param {Control} control 控件实例
         */
        helper.initViewContext = function (control) {
            var viewContext = control.viewContext || ui.getViewContext();

            delete control.viewContext;
            control.setViewContext(viewContext);
        };

        /**
         * 初始化控件扩展
         * 
         * @param {Control} control 控件实例
         */
        helper.initExtensions = function(control) {
            // 附加全局扩展
            var extensions = control.extensions;
            if (!(extensions instanceof Array)) {
                extensions = control.extensions = [];
            }
            Array.prototype.push.apply(
                extensions, 
                require('./main').createGlobalExtensions()
            );

            // 同类型扩展去重
            var extensionTypes = {};
            for (var i = 0, len = extensions.length; i < len; i++) {
                var type = extensions[i].type;
                if (extensionTypes[type]) {
                    extensions.splice(i, 1);
                    i--;
                }

                extensionTypes[type] = 1;
            }
        };

        /**
         * 处理控件相关dom元素的class操作
         * 
         * @inner
         * @param {string} type 操作类型，add|remove
         * @param {HTMLElement} element dom元素
         * @param {Control} control 控件实例
         * @param {string=} part 部件名称
         */
        function processClass(type, element, control, part) {
            var classes = helper.getClasses(control, part);

            for (var i = 0; i < classes.length; i++) {
                lib[type + 'Class'](element, classes[i]);
            }
        }

        /**
         * 为控件相关dom元素添加class
         * 
         * @param {HTMLElement} element dom元素
         * @param {Control} control 控件实例
         * @param {string=} part 部件名称
         */
        helper.addClass = function (element, control, part) {
            processClass('add', element, control, part);
        };

        /**
         * 为控件相关dom元素移除class
         * 
         * @param {HTMLElement} element dom元素
         * @param {Control} control 控件实例
         * @param {string=} part 部件名称
         */
        helper.removeClass = function (element, control, part) {
            processClass('remove', element, control, part);
        };

        /**
         * 获取用于控件dom元素的class
         * 如果控件设置了skin则返回数组中包含皮肤className
         * 
         * @param {Control} control 控件实例
         * @param {string=} part 部件名称
         * @return {Array} 
         */
        helper.getClasses = function (control, part) {
            part = part ? '-' + part : '';

            var uiPrefix = ui.getConfig('uiClassPrefix');
            var skinPrefix = ui.getConfig('skinClassPrefix');

            var type = control.type;
            var classes = [ uiPrefix + '-' + type + part ];
            part && classes.push(uiPrefix + part);

            var skin = control.skin;
            if (skin) {
                classes.push(skinPrefix + '-' + type + '-' + skin + part);
            }

            return classes;
        };

        /**
         * 获取用于控件dom元素的id
         * 
         * @param {Control} control 控件实例
         * @param {string=} part 部件名称
         * @return {string} 
         */
        helper.getId = function (control, part) {
            part = part ? '-' + part : '';
            return 'ctrl--' + control.id + part;
        };

        /**
         * 判断控件是否处于inited生命周期
         * 
         * @param {Control} control 控件实例
         * @return {boolean}
         */
        helper.isInited = function (control) {
            return control.lifeCycle == getLifeCycle().INITED;
        };

        /**
         * 初始化控件主元素
         * 
         * @param {Control} control 控件实例
         */
        helper.initMain = function (control) {
            var main = control.main;
            if (main && helper.isInited(control)) {
                if (!main.id) {
                    main.id = helper.getId(control);
                }

                helper.addClass(main, control);
            }
        };

        /**
         * 执行控件渲染前动作
         * 
         * @param {Control} control 控件实例
         */
        helper.beforeRender = function (control) {
            if (helper.isInited(control)) {
                control.fire('beforerender');
            }
        };

        /**
         * 执行控件渲染后动作
         * 
         * @param {Control} control 控件实例
         */
        helper.afterRender = function (control) {
            var LifeCycle = require('./Control').LifeCycle;
            if (helper.isInited(control)) {
                control.fire('afterrender');
            }

            control.lifeCycle = LifeCycle.RENDERED;
        };

        /**
         * 销毁控件
         * 
         * @param {Control} control 控件实例
         */
        helper.dispose = function (control) {
            // 清理子控件
            var children = control.children;
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                if (child) {
                    child.dispose();
                }
            }
            control.children = null;
            control.childrenIndex = null;

            // 移除自身行为
            control.main = null;

            // 从视图环境移除
            control.viewContext.remove(control);
        };

        /**
         * 执行控件销毁前动作
         * 
         * @param {Control} control 控件实例
         */
        helper.beforeDispose = function (control) {
            control.fire('beforedispose');
        };

        /**
         * 执行控件销毁后动作
         * 
         * @param {Control} control 控件实例
         */
        helper.afterRender = function (control) {
            control.lifeCycle = getLifeCycle().DISPOSED;
            control.fire('afterdispose');
        };

        /**
         * 验证输入控件合法性
         * 
         * @param {InputControl} control 输入控件实例
         * @param {boolean} justCheck 是否仅验证，不显示错误信息
         * @return {boolean}
         */
        helper.validate = function (control, justCheck) {
            var validity = new require('./validate/Validity')();
            var eventArg = {
                validity: validity
            };
            control.fire('beforevalidate', eventArg);

            // 验证合法性
            var rules = ui.createRulesByControl(control);
            for (var i = 0, len = rules.length; i < len; i++) {
                var rule = rules[i];
                validity.addState( 
                    rule.getName(), 
                    rule.check(control.getValue(), control)
                );
            }

            // 触发invalid和aftervalidate事件
            // 这两个事件中用户可能会对validity进行修改操作
            // 所以validity.isValid()结果不能缓存
            if (!validity.isValid()) {
                control.fire('invalid', eventArg);
            }
            control.fire('aftervalidate', eventArg);

            // 提示验证错误信息
            if (!justCheck) {
                helper.showValidity(control, validity);
            }

            return validity.isValid();
        };

        /**
         * 显示控件错误信息
         * 
         * @param {InputControl} control 输入控件实例
         * @param {validate/Validity} validity 验证信息实例
         */
        helper.showValidity = function (control, validity) {
            // TODO: 简单实现了个alert版本，需要重新实现
            // 如果是展现到页面中的dom元素，需要考虑：
            //    当验证合法时，清除或隐藏该dom
            if (!validity.isValid()) {
                var message = [];
                var states = validity.getStates();
                for (var i = 0, len = states.length; i < len; i++) {
                    var state = states[i];
                    if (!state.getState()) {
                        message.push(state.getMessage());
                    }
                }

                alert(message.join('\n'));
            }
        };

        return helper;
    }
);