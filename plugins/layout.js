import { dirname } from 'node:path'
import { read } from 'to-vfile'
import { mergeDocuments } from 'hast-util-merge'
import {
	extract as extractSlots,
	replace as injectSlots,
} from 'hast-util-slots'
import lookup from '../lib/lookup.js'

const ERROR_PATH_UNDEFINED = 'Path of processing file is not defined'

/**
 * @typedef {import('hast').Element} Element
 */

/**
 * @param {Element} layout - tree, where slots get substituted
 * @param {Element} page - tree, where slots are extracted from
 */
const mergeBody = (layout, page) => {
	const slots = extractSlots(page)
	injectSlots(layout, slots)
	return layout
}

/**
 * Merges from the most specific to the most global
 *
 * @param {Element[]} sources - trees to merge
 */
const mergeReverse = (...sources) => {
	const page = sources.at(-1)
	return sources.reverse().slice(1).reduce((page, layout) =>
		mergeDocuments(layout, page, { mergeBody }), page)
}

/**
 * @param options
 * @param options.pattern: string - glob pattern to module with transformer
 * @param options.basePath: string - path where website code is located
 * @param {number} options.lookupLimit - maximum level above the current file
 *   to look up for the loader
 * @this typeof rehype
 */
function layout(options) {
	const processor = this

	const pattern = options?.pattern ?? 'layout.html'
	const basePath = options?.basePath ?? process.cwd()

	// Preprocessor applies to the layout tree all plugins that
	// were applied to the page before injecting into the template
	const preprocessor = processor()
	preprocessor.attachers.length = processor.freezeIndex // up to this plugin
	preprocessor.freeze()

	const loadLayout = async (path) => {
		const file = await read(path)
		let tree = preprocessor.parse(file)

		if (options?.preprocess) {
			tree = preprocessor.run(tree, file)
		}

		return tree
	}

	const wrapLayouts = async (page, file) => {
		if (file.path == null) {
			console.warn(ERROR_PATH_UNDEFINED)
			return
		}

		const layoutPaths = await lookup(pattern, dirname(file.path), {
			dir: basePath,
			limit: options?.lookupLimit,
		})

		const layouts = await Promise.all(layoutPaths.map(loadLayout))

		// Arguments ordered from the most global to the most specific
		return mergeReverse(...layouts.reverse(), page)
	}

	return wrapLayouts
}

export default layout
