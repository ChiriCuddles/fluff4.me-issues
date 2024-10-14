import type Component from "ui/Component"
import State from "utility/State"

namespace FocusListener {
	let lastFocused: Element | undefined

	export const hasFocus = State<boolean>(false)

	export function focused (): Element | undefined {
		return lastFocused
	}

	export function focusedComponent (): Component | undefined {
		return lastFocused?.component
	}

	export function listen () {
		document.addEventListener("focusin", updateFocusState)
		document.addEventListener("focusout", updateFocusState)
	}

	function updateFocusState () {
		if (document.activeElement && document.activeElement !== document.body && location.hash && document.activeElement.id !== location.hash.slice(1))
			history.pushState(undefined, "", " ")

		const focused = document.querySelector(":focus-visible") ?? undefined
		if (focused === lastFocused)
			return

		const lastFocusedComponent = lastFocused?.component
		if (lastFocusedComponent)
			lastFocusedComponent.focused.value = false

		const oldAncestors = !lastFocusedComponent ? undefined : [...lastFocusedComponent.getAncestorComponents()]

		const focusedComponent = focused?.component
		if (focusedComponent)
			focusedComponent.focused.value = true

		const newAncestors = !focusedComponent ? undefined : [...focusedComponent.getAncestorComponents()]

		if (oldAncestors)
			for (const ancestor of oldAncestors)
				if (!newAncestors?.includes(ancestor))
					if (ancestor)
						ancestor.hasFocused.value = false

		if (newAncestors)
			for (const ancestor of newAncestors)
				if (ancestor)
					ancestor.hasFocused.value = true

		lastFocused = focused
		hasFocus.value = !!focused
	}

}

export default FocusListener
Object.assign(window, { FocusListener })
