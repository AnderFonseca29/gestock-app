import { Component, inject, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../services/auth';

gsap.registerPlugin(ScrollTrigger);

interface TarjetaInfo {
  titulo: string;
  subtitulo: string;
  contenidoHtml: string;
}

@Component({
  selector: 'app-pagina',
  standalone: true,
  imports: [],
  templateUrl: './pagina.html',
  styleUrl: './pagina.css'
})
export class PaginaComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Escena Three.js & Animación
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private resizeListener!: () => void;
  private animationFrameId!: number;

  // Piezas de la Caja Articulada
  private boxGroup!: THREE.Group;
  private flapLeft!: THREE.Group;
  private flapRight!: THREE.Group;
  private flapFront!: THREE.Group;
  private flapBack!: THREE.Group;

  // Núcleo e iluminación
  private innerItem!: THREE.Mesh;
  private particlesGroup!: THREE.Group;
  private coreLight!: THREE.PointLight;

  // Estado del Modal
  tarjetaSeleccionada: TarjetaInfo | null = null;

  // Información detallada de las tarjetas
  private datosTarjetas: Record<number, TarjetaInfo> = {
    1: {
      titulo: 'Control de Inventario RFID',
      subtitulo: 'Llevar el control de tu inventario nunca había sido tan fácil',
      contenidoHtml: `
        <p>Las soluciones RFID le proporcionan información útil y eficaz acerca de la situación o estado de sus productos allí donde se encuentren.</p>
        <p>Obtendrá una simplificación y automatización en todos los procesos de obtención de información, así como una seguridad y autenticidad en tiempo real.</p>
      `
    },
    2: {
      titulo: 'Fiabilidad de Datos',
      subtitulo: 'Toma de decisiones rápidas con información 100% segura',
      contenidoHtml: `
        <p>Una de las grandes preocupaciones en las empresas es asegurar la «Fiabilidad de los Datos» con un elevado porcentaje de seguridad, algo necesario para poder tomar decisiones y así poder reaccionar con inmediatez sin dedicarle tiempo.</p>
        <p>Las soluciones RFID dotan de inteligencia a los productos, movimientos y procesos empresariales para que pueda conocer con fiabilidad y rapidez los datos que necesite, cuando los necesite y como los necesite obtener.</p>
      `
    },
    3: {
      titulo: 'Gestor de Objetos',
      subtitulo: 'Conoce tu inventario y haz que tu empresa crezca',
      contenidoHtml: `
        <p>Gestión inteligente de entradas, salidas y existencias en tiempo real.</p>
        <div style="background: #0f172a; padding: 1rem; border-radius: 8px; border: 1px solid #38bdf8; text-align: center; margin-top: 1rem;">
          <strong style="color: #38bdf8;">CONTROL DE INVENTARIO INTELIGENTE</strong>
          <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.5rem;">
            <span style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem;">Entrada</span>
            <span style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem;">Inventario</span>
            <span style="background: #1e293b; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem;">Salida</span>
          </div>
        </div>
      `
    },
    4: {
      titulo: '¿Quiénes somos?',
      subtitulo: 'Transformación y desarrollo tecnológico',
      contenidoHtml: `
        <p>Un aliado tecnológico enfocado en desarrollar e implementar proyectos de transformación tecnológica y digital a la medida de las necesidades del cliente.</p>
        <div style="text-align: center; font-size: 2.5rem; margin-top: 1rem;"><i class="fas fa-users" style="font-size:2.5rem;"></i></div>
      `
    },
    5: {
      titulo: 'Reseñas de Usuarios',
      subtitulo: '<i class="fas fa-star"></i> 4.8 Ranking de estrellas',
      contenidoHtml: `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="background: #1e293b; padding: 0.75rem; border-radius: 8px;">
            <strong>Maria Gonzalez <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></strong>
            <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: #cbd5e1;">"Antes perdía muchas ventas por no controlar el inventario. Ahora sé exactamente qué tengo."</p>
          </div>
          <div style="background: #1e293b; padding: 0.75rem; border-radius: 8px;">
            <strong>Roberto Bolañoz <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></strong>
            <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: #cbd5e1;">"Con Gestock pude organizar mis ventas y ahora facturo 40% más que antes."</p>
          </div>
          <div style="background: #1e293b; padding: 0.75rem; border-radius: 8px;">
            <strong>Rodolfo Hernandez <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></strong>
            <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: #cbd5e1;">"Gestock me ayudó a entender cuáles servicios me dan más ganancia."</p>
          </div>
        </div>
      `
    }
  };

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    try {
      this.init3DScene();
      this.setupScrollAnimations();
    } catch (err) {
      console.warn('[GESTOCK] La animación 3D no pudo inicializarse, la página continúa funcionando.', err);
    }
  }

  private init3DScene(): void {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 2.5, 6.5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(5, 8, 5);

    this.coreLight = new THREE.PointLight(0x38bdf8, 0, 10);
    this.coreLight.position.set(0, 0.2, 0);

    this.scene.add(ambientLight, mainLight, this.coreLight);

    this.boxGroup = new THREE.Group();

    // Material Cartón
    const yellowMaterial = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      roughness: 0.6,
      side: THREE.DoubleSide
    });

    const size = 2;
    const height = 1.4;
    const thickness = 0.04;

    // Base
    const baseGeo = new THREE.BoxGeometry(size, thickness, size);
    const base = new THREE.Mesh(baseGeo, yellowMaterial);
    base.position.y = -height / 2;
    this.boxGroup.add(base);

    // Paredes
    const wallGeo = new THREE.BoxGeometry(size, height, thickness);

    const wallBack = new THREE.Mesh(wallGeo, yellowMaterial);
    wallBack.position.set(0, 0, -size / 2);
    this.boxGroup.add(wallBack);

    const wallFront = new THREE.Mesh(wallGeo, yellowMaterial);
    wallFront.position.set(0, 0, size / 2);
    this.boxGroup.add(wallFront);

    const wallLeft = new THREE.Mesh(wallGeo, innerMaterial);
    wallLeft.rotation.y = Math.PI / 2;
    wallLeft.position.set(-size / 2, 0, 0);
    this.boxGroup.add(wallLeft);

    const wallRight = new THREE.Mesh(wallGeo, innerMaterial);
    wallRight.rotation.y = Math.PI / 2;
    wallRight.position.set(size / 2, 0, 0);
    this.boxGroup.add(wallRight);

    // Tapas Móviles
    const flapWidth = size;
    const flapDepth = size / 2;
    const flapGeo = new THREE.BoxGeometry(flapWidth, thickness, flapDepth);

    // Tapa Izquierda
    this.flapLeft = new THREE.Group();
    this.flapLeft.position.set(-size / 2, height / 2, 0);
    const mFlapLeft = new THREE.Mesh(flapGeo, yellowMaterial);
    mFlapLeft.rotation.y = Math.PI / 2;
    mFlapLeft.position.set(flapDepth / 2, 0, 0);
    this.flapLeft.add(mFlapLeft);
    this.flapLeft.rotation.z = -Math.PI / 2;
    this.boxGroup.add(this.flapLeft);

    // Tapa Derecha
    this.flapRight = new THREE.Group();
    this.flapRight.position.set(size / 2, height / 2, 0);
    const mFlapRight = new THREE.Mesh(flapGeo, yellowMaterial);
    mFlapRight.rotation.y = Math.PI / 2;
    mFlapRight.position.set(-flapDepth / 2, 0, 0);
    this.flapRight.add(mFlapRight);
    this.flapRight.rotation.z = Math.PI / 2;
    this.boxGroup.add(this.flapRight);

    // Tapa Trasera
    this.flapBack = new THREE.Group();
    this.flapBack.position.set(0, height / 2, -size / 2);
    const mFlapBack = new THREE.Mesh(flapGeo, yellowMaterial);
    mFlapBack.position.set(0, 0, flapDepth / 2);
    this.flapBack.add(mFlapBack);
    this.flapBack.rotation.x = Math.PI / 2;
    this.boxGroup.add(this.flapBack);

    // Tapa Frontal
    this.flapFront = new THREE.Group();
    this.flapFront.position.set(0, height / 2, size / 2);
    const mFlapFront = new THREE.Mesh(flapGeo, yellowMaterial);
    mFlapFront.position.set(0, 0, -flapDepth / 2);
    this.flapFront.add(mFlapFront);
    this.flapFront.rotation.x = -Math.PI / 2;
    this.boxGroup.add(this.flapFront);

    // Núcleo Holográfico
    const itemGeo = new THREE.IcosahedronGeometry(0.55, 2);
    const itemMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8
    });
    this.innerItem = new THREE.Mesh(itemGeo, itemMat);
    this.innerItem.position.set(0, -0.2, 0);
    this.boxGroup.add(this.innerItem);

    // Partículas
    this.particlesGroup = new THREE.Group();
    const pCount = 60;
    const pPositions = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount * 3; i++) {
      pPositions[i] = (Math.random() - 0.5) * 2;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0
    });

    const particles = new THREE.Points(pGeo, pMat);
    this.particlesGroup.position.set(0, 0.4, 0);
    this.particlesGroup.add(particles);
    this.boxGroup.add(this.particlesGroup);

    // Inclinación inicial
    this.boxGroup.rotation.x = 0.35;
    this.boxGroup.rotation.y = -0.55;
    this.scene.add(this.boxGroup);

    // Bucle de Animación
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      if (this.innerItem) {
        this.innerItem.rotation.y += 0.01;
        this.innerItem.rotation.x += 0.005;
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    this.resizeListener = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.resizeListener);
  }

  private setupScrollAnimations(): void {
    const cards = document.querySelectorAll('.feature-card');
    if (!cards.length) return;

    if (!this.boxGroup || !this.innerItem || !this.particlesGroup || !this.coreLight) {
      return;
    }

    const pMaterial = (this.particlesGroup.children[0] as THREE.Points).material as THREE.PointsMaterial;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.section-3d-experience',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      }
    });

    // 1. Muestra tarjeta 1 con caja cerrada
    tl.to(this.boxGroup.rotation, { y: 0.1, x: 0.35, duration: 2 }, 0)
      .to(cards[0], { opacity: 1, y: 0, duration: 1 }, 0.5)
      .to(cards[0], { opacity: 0, duration: 0.5 }, 2);

    // 2. Apertura de tapas & Núcleo sale
    tl.to(this.flapLeft.rotation, { z: Math.PI * 0.4, duration: 2 }, 2)
      .to(this.flapRight.rotation, { z: -Math.PI * 0.4, duration: 2 }, 2)
      .to(this.flapFront.rotation, { x: Math.PI * 0.4, duration: 2 }, 2)
      .to(this.flapBack.rotation, { x: -Math.PI * 0.4, duration: 2 }, 2)
      .to(this.innerItem.position, { y: 0.8, duration: 1.8, ease: 'power2.out' }, 2.2)
      .to(this.coreLight, { intensity: 5, duration: 1.5 }, 2.2)
      .to(pMaterial, { opacity: 0.8, duration: 1 }, 2.5)
      .to(cards[1], { opacity: 1, y: 0, duration: 1 }, 2.8)
      .to(cards[1], { opacity: 0, duration: 0.5 }, 4.2);

    // 3. Apertura total y elevación
    tl.to(this.flapLeft.rotation, { z: Math.PI * 0.65, duration: 1.5 }, 4.5)
      .to(this.flapRight.rotation, { z: -Math.PI * 0.65, duration: 1.5 }, 4.5)
      .to(this.flapFront.rotation, { x: Math.PI * 0.65, duration: 1.5 }, 4.5)
      .to(this.flapBack.rotation, { x: -Math.PI * 0.65, duration: 1.5 }, 4.5)
      .to(this.boxGroup.rotation, { y: Math.PI * 1.5, x: 0.25, duration: 2.5 }, 4.5)
      .to(this.innerItem.position, { y: 1.2, duration: 1.5 }, 4.5)
      .to(this.innerItem.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 1.5 }, 4.5)
      .to(cards[2], { opacity: 1, scale: 1, duration: 1 }, 5.2);
  }

  private onWindowResize(): void {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  abrirModal(id: number): void {
    this.tarjetaSeleccionada = this.datosTarjetas[id] || null;
  }

  cerrarModal(): void {
    this.tarjetaSeleccionada = null;
  }

  scrollASeccion(id: string): void {
    if (!this.isBrowser) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  irAlSistema(): void {
    if (this.authService.estaAutenticado()) {
      console.log('[NAVEGACIÓN] Usuario autenticado. Redirigiendo a /app...');
      this.router.navigate(['/app']);
    } else {
      console.warn('[ACCESO DENEGADO] Debe registrarse o iniciar sesión.');
      this.irALogin();
    }
  }

  irALogin(): void {
    this.router.navigate(['/auth']);
  }

  abrirWhatsApp(): void {
    const numero = '573106863660';
    const mensaje = encodeURIComponent('Hola GESTOCK, me gustaría recibir más información.');
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }

    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }
}