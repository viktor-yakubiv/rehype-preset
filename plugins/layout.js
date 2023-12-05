import { dirname } from 'node:path'
import { read } from 'to-vfile'
import { mergeTrees } from 'hast-util-merge'
import lookup from '../lib/lookup.js'

const ERROR_PATH_UNDEFINED = 'Path of processing file is not defined'

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

		// Reversed to order from more global to more specific
		return mergeTrees(...layouts.reverse(), page)
	}

	return wrapLayouts
}

export default layout
