define(function (require) {
    var Form = require('esui/Form');
    var container = document.getElementById('container');

    describe('Form', function () {
        describe('created via script', function () {
            it('should create a `<form>` element', function () {
                var form = new Form();
                expect(form.main.nodeName.toLowerCase()).toBe('form');
            });

            it('should create a `<form>` element even `tagName` is given from constructor', function () {
                var form = new Form({ tagName: 'div' });
                expect(form.get('tagName')).toBe('form');
                expect(form.main.nodeName.toLowerCase()).toBe('form');
            });

            it('should render `action` attribute to `<form>` element if given', function () {
                var form = new Form({ action: 'abc' });
                expect(form.get('action')).toBe('abc');
                expect(form.main.getAttribute('action')).toBe('abc');
            });

            it('should make the `<form>` element\'s `method` attribute "POST"', function () {
                var form = new Form();
                expect(form.main.getAttribute('method').toUpperCase()).toBe('POST');
            });
        });

        describe('create via HTML', function () {
            it('should read `action` method from main element', function () {
                var main = document.createElement('form');
                main.action = 'abc';
                var form = new Form({ main: main });
                expect(form.get('action')).toBe('abc');
            });
        });

        var InputControl= require('esui/InputControl');
        function FakeInput(name, i) {
            this.rawValue = i;
            this.name = name;
            InputControl.call(this, {});
        }
        require('esui/lib').inherits(FakeInput, InputControl);

        describe('generally', function () {
            it('should collect all `rawValue` from its children', function () {
                var inputs = [
                    new FakeInput('a', 1),
                    new FakeInput('b', 2)
                ];
                var form = new Form();
                form.addChild(inputs[0]);
                form.addChild(inputs[1]);
                var data = form.getData();
                expect(data).toEqual({ a: 1, b: 2 });
            });

            it('should be able collect `rawValue` from its deep decendants', function () {
                var child = new FakeInput('a', 1);
                child.addChild(new FakeInput('b', 2));
                var form = new Form();
                form.addChild(child);
                var data = form.getData();
                expect(data).toEqual({ a: 1, b: 2 });
            });
        })
    });
});