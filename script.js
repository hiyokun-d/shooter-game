const canvas = document.getElementById("canvas");
const healthBar = document.getElementById("health")
const ammo = document.getElementById("ammo")
const scoreText = document.getElementById("score")
const playButton = document.getElementById("play")
const homeMenu = document.getElementById("home-menu")
const ctx = canvas.getContext("2d");

let width = innerWidth;
let height = innerHeight;
let score = 0;

let gameOver = true;

addEventListener("resize", () => {
	width = innerWidth;
	height = innerHeight;
});

let Player = {
	x: width / 2 - 30 / 2,
	y: height / 2 - 30 / 2,
	size: 30,
	color: "rgba(186, 85, 211, 1)",
	movement: {
		left: false,
		right: false,
		up: false,
		down: false,
	},
	ammo: 25,
	maxAmmo: 10,
	health: 100,
};

let mousePosition = {
	x: 0,
	y: 0,
};

let ProjectileArray = [];

class Projectile {
	constructor(x, y, direction) {
		this.x = x;
		this.y = y;
		this.direction = direction;
		this.velocity = 0;
		this.lifespan = 100;
	}

	draw(context) {
		context.save();
		context.translate(this.x, this.y);
		context.rotate(this.direction);
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(-5, 5);
		context.lineTo(5, 5);
		context.closePath();
		context.fill();
		context.restore();
	}

	update() {
		this.x += this.velocity * Math.cos(this.direction);
		this.y += this.velocity * Math.sin(this.direction);
		this.lifespan--;
	}

	isExpired() {
		return this.lifespan <= 0;
	}
}

class Item {
	constructor() {
		this.x = Math.random() * canvas.width;
		this.y = Math.random() * canvas.height;
		this.radius = 10;
		this.ammo = Math.min(Math.floor(Math.random() * (Player.maxAmmo - 2)) + 2, Player.maxAmmo)
		this.spawn()
	}


	spawn() {
		this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
		this.y = Math.random() * (canvas.height - this.radius * 2) + this.radius;

		// Check if the item is too close to the player
		const distance = Math.sqrt((this.x - Player.x) ** 2 + (this.y - Player.y) ** 2);
		if (distance < Player.size + this.radius * 2) {
			// If the item is too close, try spawning it again
			this.spawn();
		}
	}

	draw(context) {
		context.fillStyle = "rgba(144, 238, 144, 1)";
		context.beginPath();
		context.moveTo(this.x, this.y - this.radius);
		context.lineTo(this.x - this.radius, this.y + this.radius);
		context.lineTo(this.x + this.radius, this.y + this.radius);
		context.closePath();
		context.fill();

		context.fillStyle = "white";
		context.font = "16px sans-serif";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.shadowColor = "rgba(0, 0, 0, 0.5)";
		context.shadowBlur = 4;
		context.shadowOffsetX = 2;
		context.shadowOffsetY = 2;
		context.fillText(`+${this.ammo}`, this.x, this.y - this.radius - 5);
	}
	pickUp(player) {
		player.ammo += this.ammo
	}
}

const itemArray = [];
const MAX_ITEM = 7;

class Enemy {
	constructor() {
		this.size = 50;
		this.speed = 5;
		// Set the initial position of the enemy
		this.x = Math.random() < 0.5 ? -this.size : canvas.width + this.size;
		this.y = Math.random() * canvas.height;


		// Generate a random color similar to the player's color
		const r = Math.floor(Math.random() * 20) + 186;
		const g = Math.floor(Math.random() * 20) + 85;
		const b = Math.floor(Math.random() * 20) + 211;
		this.color = `rgba(${r}, ${g}, ${b}, 1)`;

		this.health = Math.floor(Math.random() * (150 - 20 + 1)) + 20;
	}

	draw(context) {
		// Set the enemy's color as the fill style
		context.fillStyle = this.color;

		// Draw the enemy as a square
		context.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

		// Draw the health bar
		context.fillStyle = "red";
		context.fillRect(this.x - this.size / 2, this.y - this.size / 2 - 10, this.size * (this.health / 100), 5);
	}

	update() {
		// Calculate the angle to the player
		const angle = Math.atan2(Player.y - this.y, Player.x - this.x);

		// Calculate the new position of the enemy
		this.x += Math.cos(angle) * this.speed;
		this.y += Math.sin(angle) * this.speed;
	}
}

// class Particle {
// 	constructor() {
// 		this.x = 0;
// 		this.y = 0;
// 		this.vx = 0;
// 		this.vy = 0;
// 		this.size = Math.random() * 20 + 5;
// 		this.alpha = 1
// 	}
	
// 	draw() {
// 		ctx.beginPath()
// 		const r = Math.floor(Math.random() * 256);
// 		const g = Math.floor(Math.random() * 256);
// 		const b = Math.floor(Math.random() * 256);
// 		this.color = `rgba(${r}, ${g}, ${b}, ${this.alpha})`
// 		ctx.fillStyle = this.color;
// 		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI)
// 		ctx.fill()
// 		ctx.closePath()
// 	}

// 	update(object) {
// 		setInterval(() => {
// 			this.vx += (Math.random() - 2) * 0.2;
// 			this.vy += (Math.random() - 2) * 0.2;
// 			this.x = object.x + this.vx;
// 			this.y = object.y + this.vy;
// 		}, 0)

// 		this.vx -= 1;
// 		this.vy -= 1
// 		this.alpha -= 0.5;
// 	}
// }

const enemyArray = []
// const particles = []

const enemySpawner = () => {
	if (!gameOver) {
		enemyArray.push(new Enemy)
	}
	setTimeout(enemySpawner, Math.random() * 5000 + 1000)
}

const itemSpawner = () => {
	if (itemArray.length < MAX_ITEM && !gameOver) {
		itemArray.push(new Item());
	}

	setTimeout(itemSpawner, Math.random() * 5000);
};

playButton.onclick = () => {
	homeMenu.style = "animation: slide-out-blurred-top 0.45s cubic-bezier(0.755, 0.050, 0.855, 0.060) both;"
	setTimeout(() => {
		gameOver = false;
		homeMenu.style.display = "none"
		score = 0;
	}, 1500);
}

function game() {
	requestAnimationFrame(game);
	canvas.width = width;
	canvas.height = height;
	scoreText.innerText = score
	ammo.innerText = Player.ammo;

	healthBar.style.width = `${Player.health}%`

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (gameOver && Player.health < 0) {
		homeMenu.style.display = "block"
		setTimeout(() => {
			homeMenu.style = "animation: slide-in-blurred-top 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;"
		}, 500);
	}

	if (Player.health <= 0) {
		healthBar.style.width = `0%`
		gameOver = true
	}

	for (let i = 0; i < ProjectileArray.length; i++) {
		const projectile = ProjectileArray[i];
		projectile.update();
		if (projectile.isExpired()) {
			ProjectileArray.splice(i, 1);
		}
	}

	for (let i = 0; i < itemArray.length; i++) {
		const item = itemArray[i];
		if (
			Math.abs(item.x - Player.x) < Player.size + item.radius &&
			Math.abs(item.y - Player.y) < Player.size + item.radius) {
			item.pickUp(Player);
			itemArray.splice(i, 1);
		}
	}

	// Check for collisions between the enemies and the projectiles
	for (let i = 0; i < enemyArray.length; i++) {
		if (!gameOver) {
			const enemy = enemyArray[i];
			const playerX = enemy.x - Player.x;
			const playerY = enemy.y - Player.y;
			const enemyDistance = Math.sqrt(playerX * playerX + playerY * playerY)
			if (enemyDistance < Player.size / 2) {
				enemyArray.splice(i, 1)
				Player.health -= 5
				score += 0.5
			}

			for (const element of ProjectileArray) {
				const projectile = element;

				// Calculate the distance between the enemy and the projectile
				const dx = enemy.x - projectile.x;
				const dy = enemy.y - projectile.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				// Check if the distance is less than the size of the enemy
				if (distance < enemy.size / 2) {
					// Decrease the health of the enemy
					enemy.health -= 5;

					// Destroy the projectile
					ProjectileArray.splice(i, 1)
				}
			}

			// Check if the enemy has been destroyed
			if (enemy.health <= 0) {
				// Remove the enemy from the array
				enemyArray.splice(i, 1);
				score += 1
			}
		}
	}

	for (const projectile of ProjectileArray) {
		projectile.draw(ctx);
	}

	for (const item of itemArray) {
		item.draw(ctx);
	}

	// for (const particle of particles) {
	// 	particle.draw()
	// }

	for (const enemy of enemyArray) {
		if (!gameOver) {
			enemy.update()
		}

		enemy.draw(ctx)
	}

	ctx.beginPath();
	ctx.fillStyle = Player.color;
	ctx.arc(Player.x, Player.y, Player.size, 0, 2 * Math.PI);
	ctx.fill();
	ctx.closePath();

	if (!gameOver) {
		if (Player.movement.up && Player.y > 0 - Player.size / 2) {
			Player.y = Math.max(Player.y - 10, 0 - Player.size / 2);
		} else if (Player.movement.down && Player.y < canvas.height - Player.size / 2) {
			Player.y = Math.min(Player.y + 10, canvas.height - Player.size / 2);
		}


		if (Player.movement.left && Player.x > 0 - Player.size / 2) {
			Player.x = Math.max(Player.x - 10, 0 - Player.size / 2);
		} else if (Player.movement.right && Player.x < canvas.width - Player.size / 2) {
			Player.x = Math.min(Player.x + 10, canvas.width - Player.size / 2);
		}
	}
};

function shootProjectile(mouse, player, velocity) {
	const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
	const projectile = new Projectile(player.x, player.y, angle);
	projectile.velocity = velocity;
	if (player.ammo > 0 && !gameOver) {
		player.ammo -= 1;
		ProjectileArray.push(projectile);
	}
}

addEventListener("keydown", (e) => {
	if (e.keyCode === 87) {
		Player.movement.up = true;
	} else if (e.keyCode == 83) {
		Player.movement.down = true;
	}

	if (e.keyCode == 65) {
		Player.movement.left = true;
	} else if (e.keyCode == 68) {
		Player.movement.right = true;
	}
});

addEventListener("keyup", (e) => {
	if (e.keyCode === 87) {
		Player.movement.up = false;
	} else if (e.keyCode == 83) {
		Player.movement.down = false;
	}

	if (e.keyCode == 65) {
		Player.movement.left = false;
	} else if (e.keyCode == 68) {
		Player.movement.right = false;
	}
});

addEventListener("mousemove", (e) => {
	mousePosition.x = e.clientX;
	mousePosition.y = e.clientY;
});

addEventListener("click", () => {
	shootProjectile(mousePosition, Player, 15);
});

enemySpawner()
itemSpawner();
game();
