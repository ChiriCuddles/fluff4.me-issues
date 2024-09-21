import type Component from "ui/Component"

interface ClassManipulator<HOST> {
	add (...classes: string[]): HOST
	remove (...classes: string[]): HOST
	toggle (present: boolean, ...classes: string[]): HOST
}

function ClassManipulator (component: Component.SettingUp): ClassManipulator<Component> {
	const done = component as Component
	return {
		add (...classes) {
			component.element.classList.add(...classes)
			return done
		},
		remove (...classes) {
			component.element.classList.add(...classes)
			return done
		},
		toggle (present, ...classes) {
			return this[present ? "add" : "remove"](...classes)
		},
	}
}

export default ClassManipulator