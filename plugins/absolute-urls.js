import { resolve as resolvePath, dirname } from 'node:path'
import { hasProperty as has } from 'hast-util-has-property'
import { visit } from 'unist-util-visit'

const FAKE_HOST = (Math.random() + 1).toString(36)
const FAKE_ORIGIN = 'https://' + FAKE_HOST

export default (options = {}) => (tree, file) => {
	const fileDir = dirname(file.path)
	const sourcePath = resolvePath(fileDir, options.sourcePath ?? './')
	const publicPath = options.publicPath ?? '/'

	const resolveAbsoluteUrl = (href) => {
		const fsPath = resolvePath(fileDir, href)
		const urlPath = fsPath.replace(new RegExp(`^${sourcePath}/`), publicPath)
		return urlPath
	}

	const modify = (node, prop) => {
		if (!has(node, prop)) {
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
