import { access } from 'node:fs/promises'
import { dirname } from 'node:path'
import lookup from '../lib/lookup.js'

const ERROR_PATH_UNDEFINED = 'Path of processing file is not defined. \
Local transformer is not effective.'

/**
 * @param options
 * @param {string} options?.pattern - glob pattern to module with transformer
 * @param {string} options?.basePath - path where website code is located
 * @param {number} options?.lookupLimit
 */
export default function attachTransformer(options) {
	const pattern = options?.pattern ?? 'transformer.js'
	const basePath = options?.basePath ?? process.cwd()

	const transformer = async (tree, file) => {
		if (file.path == null) {
			console.warn(ERROR_PATH_UNDEFINED)
			return
		}

		const transformerPaths = await lookup(pattern, dirname(file.path), {
			dir: basePath,
			limit: options?.lookupLimit,
		})
		const transformerPath = transformerPaths[0]

		try {
			await access(transformerPath)
		} catch (_doesNotExistError) {
			return
		}

		const module = await import(transformerPath)
		const processor = module.default
		return processor.call(this, tree, file)
	}

	return transformer
}
