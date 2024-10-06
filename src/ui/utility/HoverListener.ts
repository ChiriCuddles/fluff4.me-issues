import type Component from "ui/Component"

namespace HoverListener {
	let lastHovered: Element[] = []

	export function allHovered (): readonly Element[] {
		return lastHovered
	}

	export function hovered (): Element | undefined {
		return lastHovered.at(-1)
	}

	export function* allHoveredComponents (): Generator<Component> {
		for (const element of lastHovered) {
			const component = element.component
			if (component)
				yield component
		}
	}

	export function hoveredComponent (): Component | undefined {
		return lastHovered.at(-1)?.component
	}

	export function listen () {
		document.addEventListener("mousemove", () => {
			const allHovered = document.querySelectorAll(":hover")
			const hovered = allHovered[allHovered.length - 1]
			if (hovered === lastHovered[lastHovered.length - 1])
				return

			const newHovered = [...allHovered]
			for (const element of lastHovered)
				if (element.component?.hovered.listening && !newHovered.includes(element))
					element.component.hovered.value = false

			for (const element of newHovered)
				if (element.component?.hovered.listening && !lastHovered.includes(element))
					element.component.hovered.value = true

			lastHovered = newHovered
		})
	}

}

export default HoverListener
Object.assign(window, { HoverListener })