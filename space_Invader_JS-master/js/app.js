const scoreElement = document.querySelector('#scoreElement')
const ending = document.querySelector('#ending')
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');



canvas.width = 650
canvas.height = 650


const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []
const particles = []
const keys = {
    arrowLeft: {
        pressed: false
    },
    arrowRight: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500)
let game = {
    over: false,
    active: true
}
let score = 0;

function createParticles({ object, color, fades }) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2
            },
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            radius: Math.random() * 3,
            color: color || '#baa0de',
            fades
        }));
    }
};

const background= new Image()
background.src="img/space.jpg"


function animate() {
    if (!game.active) return

    requestAnimationFrame(animate);
    ctx.drawImage(background,0, 0, canvas.width, canvas.height)
    player.update();

    particles.forEach((particle, i) => {

        if (particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width;
            particle.position.y = -particle.radius;
        }
        if (particle.opcacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1)
            }, 0);
        } else {
            particle.update()
        }
    })

    invaderProjectiles.forEach((invaderProjectile, idx) => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(idx, 1)
            }, 0)
        } else {
            invaderProjectile.update()
        };

        // projectile hits player, create explosion, explosion removes
        if (invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width) {  
            console.log('you lose');

            setTimeout(() => {
                invaderProjectiles.splice(idx, 1);
                player.opacity = 0;
                game.over = true;
            }, 0)

            setTimeout(() => {
                game.active = false;
                console.log("game over")
                ending.style.display = 'block'
            }, 2000)

            createParticles({
                object: player,
                color: 'white',
                fades: true
            });
            
        }

        invaderProjectile.update();
    })


    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0);
        } else {
            projectile.update()
        }
    })

    grids.forEach((grid, gridIndex) => {
        grid.update();

        // spawning projectiles
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }

        grid.invaders.forEach((invader, i) => {
            invader.update({ velocity: grid.velocity })

            // projectiles hit enemy
            projectiles.forEach((projectile, j) => {
                if (projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y) {


                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(invader2 => invader2 === invader)
                        const projectileFound = projectiles.find(projectile2 => projectile2 === projectile)

                        // remove invader and projectile
                        if (invaderFound && projectileFound) {
                            score += 100
                            scoreElement.innerHTML = score

                            createParticles({
                                object: invader,
                                fades: true
                            });

                            grid.invaders.splice(i, 1)
                            projectiles.splice(j, 1)

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length - 1]

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                grid.position.x = firstInvader.position.x
                            } else {
                                grids.splice(gridIndex, 1)
                            }
                        }
                    }, 0);
                }
            })
        })
    })

    if (keys.arrowLeft.pressed && player.position.x >= 0) {
        player.velocity.x = -10;
        player.rotation = -0.15;
    } else if (keys.arrowRight.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 10;
        player.rotation = 0.15;
    } else {
        player.velocity.x = 0;
        player.rotation = 0;
    }

    // spawning enemies
    if (frames % randomInterval === 0) {
        grids.push(new Grid());
        randomInterval = Math.floor(Math.random() * 500 + 500);
        frames = 0
    }


    frames++;
}
animate()

window.addEventListener('keydown', ({ key }) => {
    if (game.over) return

    switch (key) {
        case 'ArrowLeft':
            keys.arrowLeft.pressed = true
            break;
        case 'ArrowRight':
            keys.arrowRight.pressed = true
            break;
        case ' ':
            projectiles.push(
                new Projectile({
                    position: {
                        x: player.position.x + player.width / 2,
                        y: player.position.y
                    },
                    velocity: {
                        x: 0,
                        y: -20
                    }
                }))
            break;
    }
})


window.addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'ArrowLeft':
            keys.arrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.arrowRight.pressed = false;
            break;
        case ' ':
            break;
    }
})