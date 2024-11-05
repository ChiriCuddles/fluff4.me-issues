import type { Work } from "api.fluff4.me"
import EndpointWorkGet from "endpoint/work/EndpointWorkGet"
import ActionRow from "ui/component/core/ActionRow"
import Button from "ui/component/core/Button"
import Slot from "ui/component/core/Slot"
import ViewTransition from "ui/view/component/ViewTransition"
import View from "ui/view/View"
import ViewDefinition from "ui/view/ViewDefinition"
import WorkEditForm from "ui/view/work/WorkEditForm"
import State from "utility/State"

interface WorkEditViewParams {
	author: string
	vanity: string
}

export default ViewDefinition({
	create: async (params: WorkEditViewParams | undefined) => {
		const view = View("work-edit")

		const work = params && await EndpointWorkGet.query({ params })
		if (work instanceof Error)
			throw work

		const state = State<Work | undefined>(work?.data)
		const stateInternal = State<Work | undefined>(work?.data)

		Slot()
			.use(state, (slot) => { WorkEditForm(stateInternal)?.appendTo(slot) })
			.appendTo(view)

		Slot()
			.use(state, (slot) => { createActionRow()?.appendTo(slot) })
			.appendTo(view)

		stateInternal.subscribe(view, work =>
			ViewTransition.perform("subview", () => state.value = work))

		return view

		function createActionRow (): ActionRow | undefined {
			if (!stateInternal.value)
				return

			return ActionRow()
				.tweak(row => row.right
					.append(Button()
						.text.use("view/work-edit/action/delete")
						.event.subscribe("click", async () => {
							// const response = await EndpointAuthorDelete.query()
							// if (response instanceof Error) {
							// 	console.error(response)
							// 	return
							// }

							// return Session.reset()
						})))
		}
	},
})