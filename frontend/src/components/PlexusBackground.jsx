import React, { useRef, useEffect } from 'react';

const PlexusBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Cores do nosso tema
    const pointColor = '#39FF14'; // Verde Elétrico
    const lineColor = 'rgba(57, 255, 20, 0.2)'; // Verde Elétrico com opacidade

    let animationFrameId;
    let particlesArray = [];

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 2;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        this.x += this.speedX;
        this.y += this.speedY;
      }
      draw() {
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particlesArray = [];
      const numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y));
      }
    };

    const connect = () => {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let distance = Math.sqrt(
            (particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x) +
            (particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y)
          );

          if (distance < 100) {
            opacityValue = 1 - (distance / 100);
            ctx.strokeStyle = `rgba(57, 255, 20, ${opacityValue})`; // Usa a cor da linha com opacidade dinâmica
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    setCanvasSize();
    init();
    animate();

    window.addEventListener('resize', () => {
        setCanvasSize();
        init();
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', () => {
        setCanvasSize();
        init();
      });
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full z-0 bg-dark-void"
    />
  );
};

export default PlexusBackground;