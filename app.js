const HummusRecipe = require('hummus-recipe')
const fs = require('fs')
const Colors = require('colors')
const readline = require('readline')
const { promisify } = require('util')

const mkdir = promisify(fs.mkdir)
const exists = promisify(fs.exists)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let info = {
	file: '',
	doc: '',
	format: '',
	name: '',
	group: ''
}

let pages = {
	title: [],
	task: [],
	intro: [],
	anti: [],
	uml: [],
	keynote: [],
	review: []
}

function convertArray(array) {
	for(let i = 0; i < array.length; i++) {
		array[i] = +array[i]
	}

	return array
}

async function ask(question, split = true) {
	try {
		const result = await new Promise((resolve, reject) => {
			rl.question('↳ ', answer => {
				answer = answer.replace(/ /g, '')
				if(split) answer = answer.split('-')

				resolve(answer)
			})
		})

		return result
	} catch(err) {
		throw err
	}
}

async function init() {
	try {
		info.file = await ask(console.log('\nПуть до', 'pdf файла курсовой'.blue, ': '), false)
		if(!info.file) {
			console.log('Пожалуйста, передайте путь до', 'pdf файла курсовой'.blue)
			process.exit(1)
		}

		info.doc = await ask(console.log('\nПуть до', 'doc(x) файла курсовой'.blue, ': '), false)
		if(!info.doc) {
			console.log('Пожалуйста, передайте путь до', 'doc(x) файла курсовой'.blue)
			process.exit(1)
		}
		info.format = info.doc.indexOf('.docx') > -1 ? 'docx' : 'doc'

		info.name = await ask(console.log('\nВаша', 'Фамилия ИО'.blue, '(например Иванов И.И.): '), false)
		if(!info.name) {
			console.log('Пожалуйста, введите', 'Фамилию ИО'.blue)
			process.exit(1)
		}

		info.group = await ask(console.log('\nВаша', 'Группа'.blue, '(например ИКБО-01-17): '), false)
		if(!info.group) {
			console.log('Пожалуйста, введите', 'Группу'.blue)
			process.exit(1)
		}

		pages.title = await ask(console.log('\nНомер страниц', 'Титульника'.green, 'через "-": '))
		pages.task = await ask(console.log('\nНомер страниц', 'Задания'.green, 'через "-": '))
		pages.intro = await ask(console.log('\nНомер страниц', 'Введения(УДК)'.green, 'через "-": '))
		pages.anti = await ask(console.log('\nНомер страниц', 'Анти плагиата'.green, 'через "-": '))
		pages.uml = await ask(console.log('\nНомер страниц', 'UML-диаграммы'.green, 'через "-": '))
		pages.keynote = await ask(console.log('\nНомер страниц', 'Презентации'.green, 'через "-": '))
		pages.review = await ask(console.log('\nНомер страниц', 'Отзыва'.green, 'через "-": '))

		console.log(info)
		console.log(pages)

		rl.close()

		await generate()

		console.log('\nСгенерированные файлы находятся в папке', 'output'.red, ' \n')
		console.log('\nПоложите', 'скомпилированный код'.yellow, 'в папку ', 'output/Приложение/Релиз'.red, ' \n', 'Исходный код'.yellow, 'положите в папку', 'output/Приложение/Исходный код'.red, '\n')

		return true
	} catch(err) {
		throw err
	}
}

async function generate() {
	try {
		if(!await exists('./output')) await mkdir('./output')
		if(!await exists('./output/Антиплагиат')) await mkdir('./output/Антиплагиат')
		if(!await exists('./output/Задание')) await mkdir('./output/Задание')
		if(!await exists('./output/Курсовая работа')) await mkdir('./output/Курсовая работа')
		if(!await exists('./output/Отзыв')) await mkdir('./output/Отзыв')
		if(!await exists('./output/Подтитульный лист')) await mkdir('./output/Подтитульный лист')
		if(!await exists('./output/Титульный лист')) await mkdir('./output/Титульный лист')
		if(!await exists('./output/Приложение')) await mkdir('./output/Приложение')
		if(!await exists('./output/Приложение/Исходный код')) await mkdir('./output/Приложение/Исходный код')
		if(!await exists('./output/Приложение/Релиз')) await mkdir('./output/Приложение/Релиз')

		await createpdf(`${__dirname}/output/Титульный лист/Титульный лист.pdf`, convertArray(pages.title))
		await createpdf(`${__dirname}/output/Задание/Задание.pdf`, convertArray(pages.task))
		await createpdf(`${__dirname}/output/Подтитульный лист/Подтитульный лист.pdf`, convertArray(pages.intro))
		await createpdf(`${__dirname}/output/Антиплагиат/Антиплагиат.pdf`, convertArray(pages.anti))
		await createpdf(`${__dirname}/output/Отзыв/Отзыв.pdf`, convertArray(pages.review))
		await createpdf(`${__dirname}/output/Приложение/UML.pdf`, convertArray(pages.uml))
		await createpdf(`${__dirname}/output/Приложение/Презентация.pdf`, convertArray(pages.keynote))

		await movepdf(info.file, `./output/Курсовая работа/Курсовая работа ${info.group} ${info.name}.pdf`)
		await movepdf(info.file, `./output/${info.group} ${info.name}.pdf`)
		fs.createReadStream(info.doc).pipe(fs.createWriteStream(`./output/Курсовая работа/Курсовая работа ${info.group} ${info.name}.${info.format}`))

		return true
	} catch(err) {
		throw err
	}
}

async function createpdf(name, pages) {
	if(!pages.length) return false

	try {
		const pdf = new HummusRecipe('new', name)

		pdf.appendPage(info.file, pages)
				.endPDF()

		return pdf
	} catch(err) {
		throw err
	}
}

async function movepdf(input, output) {
	try {
		const pdf = new HummusRecipe(input, output)

		pdf.endPDF()

		return pdf
	} catch(err) {
		throw err
	}
}

init()