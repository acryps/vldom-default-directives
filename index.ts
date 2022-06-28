export function registerDirectives(Component, router) {
    Component.directives['ui-click'] = (element, value, tag, attributes) => element.onclick = event => {
        const text = attributes['ui-click-text'];
        
        if (text) {
            const originalContent = element.textContent;
            element.textContent = text;
    
            requestAnimationFrame(async () => {
                await value(event);
    
                element.textContent = originalContent;
            });
        } else {
            value(event);
        }
    
        event.stopPropagation();
    };

    Component.directives['ui-focus'] = (element, value) => element.onfocus = event => {
        value(event);
    
        event.stopPropagation();
    };
    
    Component.directives['ui-href'] = (element, value, tag, attributes) => element.onclick = event => {
        const path = router.absolute(value, element.hostingComponent);
    
        if (!router.getRoute(path)) {
            if (attributes['ui-href-target'] == 'blank') {
                open(path);
            } else {
                location.href = path;
            }
            
            return;
        }
    
        if (attributes['ui-href-target'] == 'blank') {
            open(`#${path}`);
        } else {
            router.navigate(path);
        }
    
        event.stopPropagation();
    };
    
    Component.directives['ui-href-active'] = (element, value, tag, attributes) => {
        function resolveActive() {
            if (router.activePath.startsWith(router.absolute(value === true ? attributes['ui-href'] : value, element.hostingComponent))) {
                element.setAttribute('ui-active', '');
            } else {
                element.removeAttribute('ui-active');
            }
        }
    
        addEventListener('hashchange', () => {
            resolveActive();
        });
    
        resolveActive();
    };
    
    Component.directives['id'] = (element, value, tag) => {
        if (value[0] == '.') {
            element.hostingComponent[value.substring(1)] = element;
        } else {
            element.id = value;
        }
    };
    
    Component.directives['ui-value'] = (element, value, tag) => {
        if (tag == 'option') {
            (element as any).dataValue = value;
            element.value = Math.random().toString(16).substr(2);
    
            return;
        }
    
        throw 'use [$ui-value]'
    };
    
    Component.directives['$ui-value'] = (element, accessor, tag, attriubtes, content) => {
        if (tag == 'option') {
            throw 'use [ui-value]';
        }
    
        if (attriubtes.type == 'checkbox') {
            element.checked = accessor.get();
    
            element.onchange = () => {
                accessor.set(element.checked);
    
                attriubtes['ui-change'] && attriubtes['ui-change'](element.checked);
            };
        } else if (attriubtes.type == 'date') {
            element.type = 'date';
            element.valueAsDate = accessor.get();
    
            element.onchange = () => {
                accessor.set(element.valueAsDate);
    
                attriubtes['ui-change'] && attriubtes['ui-change'](element.valueAsDate);
            };
        } else if (attriubtes.type == 'datetime-local') {
            element.type = 'datetime-local';
            element.valueAsDate = accessor.get();
    
            element.onchange = () => {
                accessor.set(element.valueAsDate);
    
                attriubtes['ui-change'] && attriubtes['ui-change'](element.valueAsDate);
            };
        } else if (attriubtes.type == 'file') {
            element.type = 'file';
            element.files = accessor.get();
    
            element.onchange = () => {
                accessor.set(element.files);
    
                attriubtes['ui-change'] && attriubtes['ui-change'](element.files);
            };
        } else if (tag == 'select') {
            content = content.flat();
    
            const initialValue = accessor.get();
            element.value = content.find(element => element.dataValue == initialValue || ((typeof element.dataValue == 'object') && (typeof initialValue == 'object') && ('id' in element.dataValue) && ('id' in initialValue) && element.dataValue?.id == initialValue?.id))?.value;

            element.onchange = () => {
                const option = content.find(option => option.value == element.value);
    
                accessor.set(option.dataValue);
    
                attriubtes['ui-change'] && attriubtes['ui-change'](option.dataValue);
            };
        } else {
            element.value = accessor.get();
            
            element.onblur = () => {
                accessor.set(element.value);
                
                attriubtes['ui-change'] && attriubtes['ui-change'](element.value);
            };
        }
    };    
}