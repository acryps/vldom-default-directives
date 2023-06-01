export function registerDirectives(Component, router) {
	Component.directives['ui-click'] = (element, value, tag, attributes) => element.onclick = async event => {
		const text = attributes['ui-click-text'];
		
		if (text) {
			const originalContent = element.textContent;
			element.textContent = text;
	
			requestAnimationFrame(async () => {
				try {
					await value(event);
				} catch (error) {
					element.hostingComponent.onerror(error);
				}
	
				element.textContent = originalContent;
			});
		} else {
			try {
				await value(event);
			} catch (error) {
				element.hostingComponent.onerror(error);
			}
		}
	
		event.stopPropagation();
	};

	Component.directives['ui-focus'] = (element, value) => element.onfocus = event => {
		value(event);
	
		event.stopPropagation();
	};
	
	Component.directives['ui-href'] = (element, value, tag, attributes) => {
		const path = router.absolute(value, element.hostingComponent);

		if (tag == 'a') {
			if (router.getRoute(path)) {
				element.setAttribute('href', `#${path}`);
			}
		}

		element.onclick = event => {
			if (!router.getRoute(path)) {
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
		}
	};
	
	Component.directives['ui-href-active'] = (element, value, tag, attributes) => {
		function resolveActive() {
			if (router.activePath.startsWith(router.absolute(value === true ? attributes['ui-href'] : value, element.hostingComponent))) {
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
			element.value = Math.random().toString(16).substring(2);
	
			return;
		}
	
		throw 'use [$ui-value]'
	};
	
	Component.directives['$ui-value'] = (element, accessor, tag, attributes, content) => {
		if (tag == 'option') {
			throw 'use [ui-value]';
		}
	
		if (attributes.type == 'checkbox') {
			element.checked = accessor.get();
	
			element.onchange = () => {
				accessor.set(element.checked);
	
				attributes['ui-change'] && attributes['ui-change'](element.checked);
			};
		} else if (attributes.type == 'date') {
			element.type = 'date';
			element.valueAsDate = accessor.get();
	
			element.onchange = () => {
				accessor.set(element.valueAsDate);
	
				attributes['ui-change'] && attributes['ui-change'](element.valueAsDate);
			};
		} else if (attributes.type == 'datetime-local') {
			element.type = 'datetime-local';

			const date = accessor.get();

			if (date) {
				element.value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
			}
	
			element.onchange = () => {
				const value = new Date(element.value);
				accessor.set(value);
	
				attributes['ui-change'] && attributes['ui-change'](value);
			};
		} else if (attributes.type == 'file') {
			element.type = 'file';
			element.files = accessor.get();
	
			element.onchange = () => {
				accessor.set(element.files);
	
				attributes['ui-change'] && attributes['ui-change'](element.files);
			};
		} else if (tag == 'select') {
			content = content.flat();
	
			const initialValue = accessor.get();
			element.value = content.find(element => element.dataValue == initialValue || ((typeof element.dataValue == 'object' && element.dataValue) && (typeof initialValue == 'object' && initialValue) && ('id' in element.dataValue) && ('id' in initialValue) && element.dataValue?.id == initialValue?.id))?.value;

			element.onchange = () => {
				const option = content.find(option => option.value == element.value);
	
				accessor.set(option.dataValue);
	
				attributes['ui-change'] && attributes['ui-change'](option.dataValue);
			};
		} else if (attributes.type == 'number') {
			element.value = accessor.get();
			
			element.onblur = () => {
				accessor.set(+element.value);
				
				attributes['ui-change'] && attributes['ui-change'](+element.value);
			};
		} else {
			element.value = accessor.get();
			
			element.onblur = () => {
				accessor.set(element.value);
				
				attributes['ui-change'] && attributes['ui-change'](element.value);
			};
		}
	};    
}