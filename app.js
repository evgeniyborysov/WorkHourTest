window.addEventListener("load", () => {
	console.log("Working!");
	getDatafromFirebase();
	// getDataFromLocalStorage();
	// drawCard(workWeek);
	f2(workWeek);
});

const time = document.querySelector(".time");
const date = document.querySelector(".date");
const btn = document.querySelector(".btn");
const table = document.querySelector(".tbody");

const startSelect = document.querySelector(".start");
const endSelect = document.querySelector(".end");
const lunch = document.querySelector(".lunch");

const cardContainer = document.querySelector(".cards");

const btnSaveToLS = document.querySelector(".to_LS");
const btnGetFromLS = document.querySelector(".from_LS");
const firebaseBTN = document.querySelector(".firebase");
const totalHour = document.querySelector(".total");

let workWeek = [
	{
		id: "20230403",
		day: "03.04.2023",
		startTime: "07:00",
		endTime: "19:00",
		lunchTime: "01:00",
		workHour: "11:00",
	},
	{
		id: "20230405",
		day: "05.04.2023",
		startTime: "07:00",
		endTime: "19:30",
		lunchTime: "01:00",
		workHour: "11:30",
	},
	{
		id: "20230406",
		day: "06.04.2023",
		startTime: "08:30",
		endTime: "20:30",
		lunchTime: "01:00",
		workHour: "11:00",
	},
];

async function getDatafromFirebase() {
	let arr = [];
	await db
		.collection("TEST")
		.get()
		.then((res) => {
			res.forEach((doc) => {
				arr.push(doc.data());
			});
		});
	console.log("APP", arr);
	arr.sort((a, b) => {
		const dateA = new Date(a.day.split(".").reverse().join("-"));
		const dateB = new Date(b.day.split(".").reverse().join("-"));
		return dateA - dateB;
	});
	// debugger;
	drawTable(arr);
	drawCard(arr);
	f2(arr);
}

function formattedTime(time) {
	return time < 10 ? `0${time}` : `${time}`;
}

generateSelect(startSelect);
generateSelect(endSelect);
// drawCard(workWeek);

function init() {
	console.log("init");
	// generateSelect(startSelect);
	// generateSelect(endSelect);
	// drawCard(workWeek);
}

function generateSelect(elem) {
	for (let i = 6; i < 24; i++) {
		for (let j = 0; j <= 30; j += 30) {
			const hour = i.toString().padStart(2, "0");
			const minute = j.toString().padStart(2, "0");
			const time = `${hour}:${minute}`;
			const option = document.createElement("option");
			option.value = time;
			option.text = time;
			elem.add(option);
		}
	}
}

function drawTable(week) {
	// debugger;
	table.innerHTML = "";
	totalHour.innerHTML = "";
	week.forEach((item) => {
		const tr = document.createElement("tr");
		// tr.classList.add("table-primary");
		tr.innerHTML = `
						<td class="editable" id="${item.id}">${item.day}</td>
						<td>${item.startTime}</td>
						<td>${item.endTime}</td>
                        <td>${item.lunchTime}</td>
						<td>${item.workHour}</td>
                        
					`;
		table.appendChild(tr);
	});

	const cells = document.querySelectorAll(".editable");
	editCells(cells);
	const a = f2(week);
	totalHour.innerHTML = `${a.hours} : ${a.minutes}`;
}

function f2(workWeek) {
	// Використовуємо метод reduce, щоб обчислити суму всіх значень workHour
	const totalWorkHours = workWeek.reduce((total, item) => {
		const workHourParts = item.workHour.split(":");
		const hours = Math.abs(parseInt(workHourParts[0]));
		const minutes = Math.abs(parseInt(workHourParts[1]));
		// const seconds = parseInt(workHourParts[2] || 0);

		// Перетворюємо час у мілісекунди, щоб зручно здійснювати обчислення
		const timeInMilliseconds = (hours * 3600 + minutes * 60) * 1000;

		// Додаємо мілісекунди до загальної суми
		return total + timeInMilliseconds;
	}, 0);

	// Перетворюємо загальний час у години, хвилини та секунди
	const hours = formattedTime(Math.floor(totalWorkHours / (1000 * 60 * 60)));
	const minutes = formattedTime(
		Math.floor((totalWorkHours / (1000 * 60)) % 60)
	);
	// const seconds = Math.floor((totalWorkHours / 1000) % 60);

	// Виводимо результат
	console.log(`Total work hours: ${hours}:${minutes}`);
	return { hours, minutes };
}

function calculateTimeElapsed(start, end, lunch = "00:00") {
	const startTime = convertTimeToMinutes(start);
	const endTime = convertTimeToMinutes(end);
	const lunchTime = convertTimeToMinutes(lunch);

	let timeElapsed = endTime - startTime - lunchTime;

	if (timeElapsed < 0) {
		timeElapsed += 1440;
	}

	const hours = Math.floor(timeElapsed / 60);
	const minutes = timeElapsed % 60;

	const formattedHours = formattedTime(hours);
	const formattedMinutes = formattedTime(minutes);

	return `${formattedHours}:${formattedMinutes}`;
}

function convertTimeToMinutes(time) {
	const [hours, minutes] = time.split(":");
	return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
}

function formatDate(date) {
	// const isoDate = date.toISOString();
	// const formattedDate = isoDate.slice(0, 10);
	const [year, month, day] = date.split("-");
	return `${day}.${month}.${year}`;
}

function fn() {
	const startWork = startSelect.value;
	const endWork = endSelect.value;
	const lunchTime = lunch.value;

	const workHour = calculateTimeElapsed(startWork, endWork, lunchTime);

	let newDay = db.collection("TEST").add({
		id: date.value,
		day: formatDate(date.value),
		startTime: startWork,
		endTime: endWork,
		lunchTime: lunchTime,
		workHour: workHour,
	});

	// workWeek.push({
	// 	id: date.value,
	// 	day: formatDate(date.value),
	// 	startTime: startWork,
	// 	endTime: endWork,
	// 	lunchTime: lunchTime,
	// 	workHour: workHour,
	// });
	// console.log(workWeek);
	// drawTable(workWeek);
	// drawCard(workWeek);
	getDatafromFirebase();
}

btn.addEventListener("click", fn);

drawTable(workWeek);

function formatDateForCards(date) {
	const formattedDate = date.toISOString().slice(0, 10);
	const [year, month, day] = formattedDate.split("-");
	return `${day}.${month}.${year}`;
}

function drawCard(arr) {
	const today = new Date();
	const tomorrow = new Date();
	tomorrow.setDate(today.getDate() + 1);

	const todayForCard = formatDateForCards(today);
	const tomorrowForCard = formatDateForCards(tomorrow);

	console.log(tomorrowForCard);

	const div = document.createElement("div");
	div.classList.add("today");

	const itemForCardToday = arr.find((item) => {
		return item.day === todayForCard;
	});

	const itemForCardTomorrow = arr.find((item) => {
		return item.day === tomorrowForCard;
	});

	console.log(itemForCardToday);

	// cardContainer;

	if (itemForCardToday) {
		cardContainer.innerHTML = "";
		div.innerHTML = `
            <div class="day-name">Today</div>			
            <div class="day">${itemForCardToday.day}</div>
			<div class="time">${itemForCardToday.startTime} - ${itemForCardToday.endTime}</div>
        `;
		cardContainer.appendChild(div);
	} else {
		cardContainer.innerHTML = "";
		div.innerHTML = `
                    <div class="day-name">Today</div>
            		<div class="day">${todayForCard}</div>
					<div class="title">Вихідний</div>
        `;
		cardContainer.appendChild(div);
	}

	const div2 = document.createElement("div");
	div2.classList.add("tomorrow");

	if (itemForCardTomorrow) {
		// cardContainer.innerHTML = "";
		div2.innerHTML = `
        <div class="day-name">Tomorrow</div>			
            <div class="day">${itemForCardTomorrow.day}</div>
			<div class="time">${itemForCardTomorrow.startTime} - ${itemForCardTomorrow.endTime}</div>
        `;
		cardContainer.appendChild(div2);
	} else {
		// cardContainer.innerHTML = "";
		div2.innerHTML = `
        <div class="day-name">Tomorrow</div>
            		<div class="day">${tomorrowForCard}</div>
					<div class="title">Вихідний</div>
        `;
		cardContainer.appendChild(div2);
	}
}

function saveDataToLocalStorage(arr) {
	// Конвертуємо масив у формат JSON
	const arrJSON = JSON.stringify(arr);
	// Зберігаємо масив у локальному сховищі під ключем "myArray"
	localStorage.setItem("myArray", arrJSON);
}

function getDataFromLocalStorage() {
	// Отримуємо масив з локального сховища
	const arrJSON = localStorage.getItem("myArray");
	if (arrJSON.length) {
		// Конвертуємо рядок JSON у масив
		workWeek = JSON.parse(arrJSON);
		workWeek.sort((a, b) => {
			const dateA = new Date(a.day.split(".").reverse().join("-"));
			const dateB = new Date(b.day.split(".").reverse().join("-"));
			return dateA - dateB;
		});

		// отримуємо всі комірки таблиці
		const cells = document.querySelectorAll(".editable");
		editCells(cells);
		drawTable(workWeek);
		drawCard(workWeek);
	}
}

btnGetFromLS.addEventListener("click", getDataFromLocalStorage);
btnSaveToLS.addEventListener("click", () => {
	saveDataToLocalStorage(workWeek);
});

function editCells(cells) {
	// додаємо обробник події для кожної комірки
	cells.forEach(function (cell) {
		cell.addEventListener("dblclick", function (event) {
			// отримуємо поточне значення комірки
			const currentValue = this.innerHTML;

			// створюємо текстовий елемент для редагування
			const input = document.createElement("input");
			input.setAttribute("type", "text");
			input.setAttribute("value", currentValue);

			// замінюємо комірку на текстовий елемент
			this.innerHTML = "";
			this.appendChild(input);

			// додаємо обробник події для текстового елемента
			input.addEventListener("blur", function () {
				// зберігаємо нове значення після редагування
				const newValue = this.value;

				const selectedObj = workWeek.find(
					(obj) => obj.id === event.target.id
				);
				selectedObj.day = newValue;
				cell.innerHTML = newValue;
			});

			// фокусуємося на текстовому елементі
			input.focus();
		});
	});
}

init();
