import { resolve as resolvePath, dirname } from 'node:path'
import { glob } from 'glob'
import { access } from 'node:fs/promises'

const ERROR_PATH_UNDEFINED = 'Path of processing file is not defined. \
Local transformer is not effective.'

/**
 * @param options
 * @param options.pattern: string - glob pattern to module with transformer
 */
export default function localTransformer(options) {
	const globPattern = options?.pattern ?? './transformer.js'

	const transformer = async (tree, file) => {
		if (file.path == null) {
			console.warn(ERROR_PATH_UNDEFINED)
			return
		}

		const modulePattern = resolvePath(dirname(file.path), globPattern)
		const modulePaths = await glob(modulePattern)
		try {
			await access(modulePaths[0])
		} catch (_doesNotExistError) {
			return
		}

		const module = await import(modulePaths[0])
		const processor = module.default
		return processor?.call(this, tree, file)
	}

	return transformer
}
