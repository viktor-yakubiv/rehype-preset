import { resolve as resolvePath } from 'node:path'
import { hasProperty as has } from 'hast-util-has-property'
import { visit } from 'unist-util-visit'

const FAKE_HOST = (Math.random() + 1).toString(36)
const FAKE_ORIGIN = 'https://' + FAKE_HOST

export default (options = {}) => (tree, file) => {
	const sourceRootPath = resolvePath(options.sourceRootPath ?? './')
	const sourceRootUrl = new URL(`file://${sourceRootPath.replace(/\/$/, '')}`)

	const publicRootPath = options.publicRootPath ?? '/'
	const publicRootUrl = new URL(publicRootPath, FAKE_ORIGIN)

	const localFileUrl = new URL(`file://${resolvePath(file.path)}`)
	const publicFileUrl = new URL(localFileUrl.toString().replace(new RegExp(`^${sourceRootUrl}/`), publicRootUrl))

	const resolveAbsoluteUrl = (href) => {
		const url = new URL(href, publicFileUrl)
		const publicHref = url.href.replace(new RegExp(`^${FAKE_ORIGIN}`), '')
		return publicHref
	}

	const modify = (node, prop) => {
		if (!has(node, prop)) {
			return
		}

		if (node.properties[prop].startsWith('#')) {
			return
		}

		const url = new URL(node.properties[prop], FAKE_ORIGIN)
		if (url.origin != FAKE_ORIGIN) {
			return
		}

		const localHref = node.properties[prop]
		const publicHref = resolveAbsoluteUrl(localHref)
		node.properties[prop] = publicHref
	}

	visit(tree, 'element', (node) => {
		modify(node, 'href')
		modify(node, 'src')
	})
}
