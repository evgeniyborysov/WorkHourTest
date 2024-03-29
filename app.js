window.addEventListener("DOMContentLoaded", () => {
	getData();
});

const time = document.querySelector(".time");
const date = document.querySelector(".date");
const btnAddNewDay = document.querySelector(".add-new-day");
const table = document.querySelector(".tbody");
const startSelect = document.querySelector(".start");
const endSelect = document.querySelector(".end");
const lunch = document.querySelector(".lunch");
const cardContainer = document.querySelector(".cards");
const inputsBlock = document.querySelector(".wrap");
const btnShowInputs = document.querySelector(".show-inputs");
const totalHour = document.querySelector(".total-hour");

const daysOfWeek = [
	"Неділя",
	"Понеділок",
	"Вівторок",
	"Середа",
	"Четвер",
	"П'ятниця",
	"Субота",
];

btnShowInputs.addEventListener("click", () => {
	inputsBlock.classList.toggle("show-inputs");
});

async function getData() {
	let arr = [];
	await db
		.collection("TEST")
		.get()
		.then((res) => {
			res.forEach((doc) => {
				arr.push({ id: doc.id, ...doc.data() });
			});
		});
	// console.log("APP", arr);
	arr.sort((a, b) => {
		const dateA = new Date(a.day.split(".").reverse().join("-"));
		const dateB = new Date(b.day.split(".").reverse().join("-"));
		return dateA - dateB;
	});

	drawTable(arr);
	drawCard(arr);
	getWorkedHours(arr);
}

function formattedTime(time) {
	return time < 10 ? `0${time}` : `${time}`;
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

//<img width="24" height="24" src="https://img.icons8.com/material-outlined/24/000000/delete-trash.png" alt="delete-trash"/>

function drawTable(week) {
	table.innerHTML = "";
	totalHour.innerHTML = "";
	week.forEach((item) => {
		const tr = document.createElement("tr");
		tr.classList.add("string-hover");
		tr.id = item.id;
		tr.innerHTML = `
						<td class="editable">${item.day}</td>
                        <td>${item.dayOfWeek}</td>
						<td>${item.startTime}</td>
						<td>${item.endTime}</td>
						<td>${item.workHour}</td>
                        <td><button class="btn btn-delete"><img width="24" height="24" src="https://img.icons8.com/material-outlined/24/000000/delete-trash.png" alt="delete-trash"/></button></td>
                        
					`;
		table.appendChild(tr);
	});

	// const cells = document.querySelectorAll(".editable");
	// editCells(cells);
	const total = getWorkedHours(week);
	totalHour.innerHTML = `${total.hours} : ${total.minutes}`;
	eventHanger(document.querySelectorAll(".btn-delete"));
}

function eventHanger(nodeList) {
	nodeList.forEach((item) => {
		item.addEventListener("click", deleteDay);
	});
}

function deleteDay() {
	const ID = this.parentNode.parentNode.id;
	// console.log(ID);

	db.collection("TEST")
		.doc(ID)
		.delete()
		.then(() => {
			getData();
			console.log("Document successfully deleted!");
		})
		.catch((error) => {
			console.error("Error removing document: ", error);
		});
}

function getWorkedHours(workWeek) {
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
	// console.log(year, month, day);
	return `${day}.${month}.${year}`;
}

function findDayOfWeek(dateString) {
	const date = new Date(dateString);

	const dayOfWeek = date.getDay();
	// console.log(daysOfWeek[dayOfWeek]);

	return daysOfWeek[dayOfWeek];
}

function formatDateForCards(date) {
	const formattedDate = date.toISOString().slice(0, 10);
	const [year, month, day] = formattedDate.split("-");
	// console.log(year, month, day);
	return `${day}.${month}.${year}`;
}

function addNewDay() {
	const startWork = startSelect.value;
	const endWork = endSelect.value;
	const lunchTime = lunch.value;

	const workHour = calculateTimeElapsed(startWork, endWork, lunchTime);

	db.collection("TEST").add({
		// id: date.value,
		day: formatDate(date.value),
		dayOfWeek: findDayOfWeek(date.value),
		startTime: startWork,
		endTime: endWork,
		lunchTime: lunchTime,
		workHour: workHour,
	});
	getData();
}

btnAddNewDay.addEventListener("click", addNewDay);

function drawCard(arr) {
	const today = new Date();
	const tomorrow = new Date();
	tomorrow.setDate(today.getDate() + 1);

	const todayForCard = formatDateForCards(today);
	const tomorrowForCard = formatDateForCards(tomorrow);

	// console.log(tomorrowForCard);

	const div = document.createElement("div");
	div.classList.add("today");

	const itemForCardToday = arr.find((item) => {
		return item.day === todayForCard;
	});

	const itemForCardTomorrow = arr.find((item) => {
		return item.day === tomorrowForCard;
	});

	if (itemForCardToday) {
		cardContainer.innerHTML = "";
		div.innerHTML = `
            <div class="day-name">Сьогодні</div>			
            <div class="day">${itemForCardToday.day}</div>
			<div class="time">${itemForCardToday.startTime} - ${itemForCardToday.endTime}</div>
        `;
		cardContainer.appendChild(div);
	} else {
		cardContainer.innerHTML = "";
		div.innerHTML = `
                    <div class="day-name">Сьогодні</div>
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
        <div class="day-name">Завтра</div>			
            <div class="day">${itemForCardTomorrow.day}</div>
			<div class="time">${itemForCardTomorrow.startTime} - ${itemForCardTomorrow.endTime}</div>
        `;
		cardContainer.appendChild(div2);
	} else {
		// cardContainer.innerHTML = "";
		div2.innerHTML = `
        <div class="day-name">Завтра</div>
            		<div class="day">${tomorrowForCard}</div>
					<div class="title">Вихідний</div>
        `;
		cardContainer.appendChild(div2);
	}
}

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

/// functions call
generateSelect(startSelect);
generateSelect(endSelect);
