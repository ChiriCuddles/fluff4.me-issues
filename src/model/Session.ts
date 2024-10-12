import type { Authorisation, AuthService } from "api.fluff4.me"
import EndpointAuthRemove from "utility/endpoint/auth/EndpointAuthRemove"
import EndpointSessionGet from "utility/endpoint/session/EndpointSessionGet"
import popup from "utility/Popup"
import State from "utility/State"
import Store from "utility/Store"

declare module "utility/Store" {
	interface ILocalStorage {
		stateToken: string
		sessionAuthServices: Authorisation[]
	}
}

namespace Session {
	export async function refresh () {
		const session = await EndpointSessionGet.query()
		const stateToken = session.headers.get("State-Token")
		if (stateToken)
			Store.items.stateToken = stateToken

		Store.items.sessionAuthServices = session?.data?.authorisations ?? undefined
		updateState()
	}

	function updateState () {
		Auth.state.value = Store.items.sessionAuthServices?.length ? "has-authorisations" : "none"
	}

	export function getStateToken () {
		return Store.items.stateToken
	}

	export namespace Auth {
		export type State =
			| "none"
			| "has-authorisations"
			| "logged-in"

		export const state = State<State>("none")

		export function getAll () {
			return Store.items.sessionAuthServices ?? []
		}

		export function get (service: string) {
			return Store.items.sessionAuthServices?.find(auth => auth.service === service)
		}

		export async function unauth (authOrId: Authorisation | string) {
			const id = typeof authOrId === "string" ? authOrId : authOrId.id
			await EndpointAuthRemove.query({ body: { id } })
			Store.items.sessionAuthServices = Store.items.sessionAuthServices?.filter(auth => auth.id !== id)
			if (!Store.items.sessionAuthServices?.length)
				delete Store.items.sessionAuthServices
			updateState()
		}

		export async function auth (service: AuthService) {
			await popup(`Login Using ${service.name}`, service.url_begin, 600, 900)
				.then(() => true).catch(err => { console.warn(err); return false })
			await Session.refresh()
		}
	}

}

Object.assign(window, { Session })

export default Session
