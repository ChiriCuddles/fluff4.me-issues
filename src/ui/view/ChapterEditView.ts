import type { Chapter } from "api.fluff4.me"
import type { ChapterParams } from "endpoint/chapter/EndpointChapterGet"
import EndpointChapterGet from "endpoint/chapter/EndpointChapterGet"
import ActionRow from "ui/component/core/ActionRow"
import Button from "ui/component/core/Button"
import Slot from "ui/component/core/Slot"
import ChapterEditForm from "ui/view/chapter/ChapterEditForm"
import View from "ui/view/shared/component/View"
import ViewDefinition from "ui/view/shared/component/ViewDefinition"
import ViewTransition from "ui/view/shared/ext/ViewTransition"
import State from "utility/State"

interface ChapterEditViewParams extends Omit<ChapterParams, "url"> {
	url?: string
}

export default ViewDefinition({
	requiresLogin: true,
	create: async (params: ChapterEditViewParams) => {
		const id = "chapter-edit"
		const view = View(id)

		const chapter = !params.url ? undefined : await EndpointChapterGet.query({ params: params as Required<ChapterEditViewParams> })
		if (chapter instanceof Error)
			throw chapter

		const state = State<Chapter | undefined>(chapter?.data)
		const stateInternal = State<Chapter | undefined>(chapter?.data)

		Slot()
			.use(state, () => ChapterEditForm(stateInternal, params).subviewTransition(id))
			.appendTo(view)

		Slot()
			.use(state, () => createActionRow()?.subviewTransition(id))
			.appendTo(view)

		stateInternal.subscribe(view, chapter =>
			ViewTransition.perform("subview", id, () => state.value = chapter))

		return view

		function createActionRow (): ActionRow | undefined {
			if (!stateInternal.value)
				return

			return ActionRow()
				.viewTransition("chapter-edit-action-row")
				.tweak(row => row.right
					.append(Button()
						.text.use("view/chapter-edit/update/action/delete")
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
