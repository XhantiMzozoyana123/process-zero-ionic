import {
  Component, AfterViewInit, OnDestroy,
  ElementRef, NgZone, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';

@Component({
  selector: 'app-replay-ai',
  templateUrl: 'replay-ai.page.html',
  styleUrls: ['replay-ai.page.scss'],
  standalone: false,
})
export class ReplayAiPage implements AfterViewInit, OnDestroy {

  @ViewChild('threeCanvas') threeCanvas!: ElementRef<HTMLCanvasElement>;

  // ── Nav feature links ──────────────────────────────────
  featureLinks = [
    { icon: 'globe-outline',      title: 'Lead Lake',           desc: 'Find better prospects fast', route: '/features/lead-lake' },
    { icon: 'people-outline',     title: 'My Contacts',         desc: 'Keep deals moving',          route: '/features/contacts' },
    { icon: 'calendar-outline',   title: 'Meetings',            desc: 'Book and track calls',       route: '/features/meetings' },
    { icon: 'cube-outline',       title: 'Products',            desc: 'Show what you sell',         route: '/features/products' },
    { icon: 'stats-chart-outline',title: 'KPI Form & Policies', desc: 'Track your progress',        route: '/features/kpi' },
  ];

  // ── How it works steps ─────────────────────────────────
  howItWorks = [
    { step: '01', title: 'Connect Your Inbox',     icon: 'link-outline',
      description: 'Connect your inbox in minutes and you are ready to go.' },
    { step: '02', title: 'AI Sends Outreach',      icon: 'sparkles-outline',
      description: 'The AI writes and sends daily cold emails for you.' },
    { step: '03', title: 'Replies Get Sorted',     icon: 'git-network-outline',
      description: 'Interested replies are picked up and sorted automatically.' },
    { step: '04', title: 'You Close More Deals',   icon: 'return-down-forward-outline',
      description: 'Hot leads land in your dashboard. You monitor inbox intent and continuously update KPI/prospect-interest status.' },
  ];

  // ── Core feature cards ─────────────────────────────────
  components = [
    { icon: 'mail-outline',                  title: 'Quick Inbox Setup',     description: 'Connect once and start sending the same day.' },
    { icon: 'layers-outline',                title: 'Done-For-You Campaigns',description: 'No writing from your side. Campaigns are prepared for you.' },
    { icon: 'shuffle-outline',               title: 'Safe Daily Sending',    description: 'Outreach runs every day with smart volume control.' },
    { icon: 'sparkles-outline',              title: 'Better Replies Over Time',description: 'The system keeps improving based on what gets responses.' },
    { icon: 'return-down-forward-outline',   title: 'Lead Delivery',         description: 'Interested replies are routed straight to your dashboard.' },
    { icon: 'bar-chart-outline',             title: 'Reply Monitoring & KPI Updates', description: 'Monitor inbox replies from interested prospects and keep KPI/prospect-interest tracking continuously updated.' },
  ];

  // ── Live activity ticker ───────────────────────────────
  liveFeed = [
    { icon: 'mail-outline',          text: 'New inbox connected — Cape Town',                time: '2m ago' },
    { icon: 'checkmark-circle',      text: '340 emails sent today for active reps',          time: '8m ago' },
    { icon: 'trending-up-outline',   text: 'Reply rate climbing this week',                  time: '19m ago' },
    { icon: 'people-outline',        text: '7 warm replies delivered to dashboards',         time: '31m ago' },
    { icon: 'calendar-outline',      text: '3 meetings booked from Replay AI leads',         time: '44m ago' },
    { icon: 'mail-outline',          text: 'New inbox connected — Johannesburg',             time: '1h ago' },
    { icon: 'flash-outline',         text: 'New outreach campaign switched on',              time: '1h ago' },
    { icon: 'checkmark-circle',      text: 'Rep sending limits safely increased',            time: '2h ago' },
    { icon: 'trending-up-outline',   text: 'Top campaign bringing strong responses',         time: '3h ago' },
    { icon: 'people-outline',        text: '12 new reps activated today',                    time: '4h ago' },
  ];

  // ── Domain nodes for network widget ───────────────────
  domainNodes = [
    { name: 'thabo@salesteam.co.za',     health: 94, emails: 48, status: 'active' },
    { name: 'lerato@repzone.co.za',      health: 88, emails: 52, status: 'active' },
    { name: 'james@prorealty.co.za',     health: 97, emails: 45, status: 'active' },
    { name: 'nandi@bizdev.co.za',        health: 71, emails: 31, status: 'active' },
    { name: 'sipho@ventures.co.za',      health: 85, emails: 44, status: 'active' },
    { name: 'anika@coldops.co.za',       health: 62, emails: 22, status: 'active' },
  ];

  // ── FAQ ────────────────────────────────────────────────
  faqs = [
    { question: 'Do I need my own inbox to use Replay AI?',
      answer: 'Yes. Connect your own work inbox so your leads and results stay tied to you.',
      open: false },
    { question: 'Will this hurt my inbox reputation?',
      answer: 'No. Sending is controlled with safe limits and smart timing to protect your inbox health.',
      open: false },
    { question: 'Will I know which replies are mine?',
      answer: 'Yes. Your replies are tracked and shown in your dashboard so you can monitor intent and update KPI/prospect-interest status quickly.',
      open: false },
    { question: 'Do I have to write cold emails myself?',
      answer: 'No. Replay AI handles writing and sending. Your role is to monitor inbox replies and continuously update KPI/prospect-interest tracking.',
      open: false },
    { question: 'How many emails can be sent each day?',
      answer: 'It starts safe and grows over time as inbox health stays strong.',
      open: false },
    { question: 'How do I make more money with this?',
      answer: 'You get more qualified conversations while you consistently monitor inbox replies and keep KPI/prospect-interest status updated so follow-up stays accurate.',
      open: false },
  ];

  // ── Testimonials ───────────────────────────────────────
  testimonials = [
    { name: 'Thabo M.',  role: 'Sales Rep, Process Zero',   avatar: 'TM',
      quote: 'I connected my inbox fast. Now I just monitor replies and keep interest KPIs updated while outreach keeps running.' },
    { name: 'Lerato K.', role: 'Business Development',       avatar: 'LK',
      quote: 'This gave me my time back. My daily role is reply monitoring and KPI updates, not manual outreach.' },
    { name: 'James O.',  role: 'Senior Sales Rep',           avatar: 'JO',
      quote: 'I have better conversations every week because I focus on tracked replies and continuous prospect-interest updates.' },
    { name: 'Nandi S.',  role: 'Account Executive',          avatar: 'NS',
      quote: 'Best part is momentum. I monitor inbox intent and update KPIs while the system keeps qualified replies flowing.' },
  ];

  activeTestimonial = 0;

  // ── Animated counters ──────────────────────────────────
  animatedDomains     = 0;
  animatedEmails      = 0;
  animatedReplyRate   = 0;
  animatedMeetings    = 0;

  // ── ROI calculator ────────────────────────────────────
  calcDomains       = 5;
  calcLeadsPerWeek  = 0;
  calcDealsPerMonth = 0;
  calcRevenue       = 0;

  // ── Live demo widget state ─────────────────────────────
  liveEmailCount   = 1284;
  liveReplyCount   = 47;
  liveMeetingCount = 12;
  liveActivityLog: { text: string; type: 'email'|'reply'|'meeting' }[] = [
    { text: 'Cold email sent to new prospect',         type: 'email' },
    { text: 'Warm reply received from a decision-maker', type: 'reply' },
    { text: 'Meeting booked for this afternoon',       type: 'meeting' },
    { text: 'Follow-up email sent automatically',      type: 'email' },
    { text: 'New hot lead delivered to dashboard',     type: 'reply' },
  ];

  private observer: IntersectionObserver | null = null;
  private testimonialTimer: any;
  private counterAnimated = false;
  private calcTimer: any;

  // Three.js
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animFrameId = 0;
  private nodes: THREE.Mesh[] = [];
  private nodeVels: { x: number; y: number; z: number }[] = [];
  private linesMesh!: THREE.LineSegments;
  private clock!: THREE.Clock;
  private mouseX = 0;
  private mouseY = 0;

  constructor(private router: Router, private el: ElementRef, private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initThreeJS();
      this.animateThreeJS();
    });
    this.setupScrollAnimations();
    this.startTestimonialRotation();
    this.updateCalc();
    this.startLiveWidget();

    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearInterval(this.testimonialTimer);
    clearInterval(this.calcTimer);
    cancelAnimationFrame(this.animFrameId);
    this.renderer?.dispose();
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
  }

  navigateTo(path: string): void { this.router.navigateByUrl(path); }

  toggleFaq(index: number): void { this.faqs[index].open = !this.faqs[index].open; }

  selectTestimonial(index: number): void {
    this.activeTestimonial = index;
    clearInterval(this.testimonialTimer);
    this.startTestimonialRotation();
  }

  get isLoggedIn(): boolean { return !!localStorage.getItem('token'); }

  // ── ROI Calculator ────────────────────────────────────
  onCalcChange(): void { this.updateCalc(); }

  private updateCalc(): void {
    const emailsPerDay   = this.calcDomains * 45;
    const weeklyEmails   = emailsPerDay * 5;
    this.calcLeadsPerWeek  = Math.round(weeklyEmails * 0.025);
    this.calcDealsPerMonth = Math.round(this.calcLeadsPerWeek * 4 * 0.12);
    this.calcRevenue       = this.calcDealsPerMonth * 3500;
  }

  // ── Live Activity Widget ──────────────────────────────
  private startLiveWidget(): void {
    const emails   = ['Cold email sent to a new prospect','Follow-up sent automatically','Daily outreach is running','Personal intro email sent by AI'];
    const replies  = ['Prospect replied: interested','Warm reply received','Prospect asked for pricing','Follow-up reminder scheduled'];
    const meetings = ['Meeting booked with a qualified lead','Call set for tomorrow morning','Prospect accepted calendar invite'];

    setInterval(() => {
      const r = Math.random();
      let entry: { text: string; type: 'email'|'reply'|'meeting' };
      if (r < 0.55)        entry = { text: emails[Math.floor(Math.random()*emails.length)],   type: 'email' };
      else if (r < 0.85)   entry = { text: replies[Math.floor(Math.random()*replies.length)], type: 'reply' };
      else                 entry = { text: meetings[Math.floor(Math.random()*meetings.length)],type: 'meeting' };

      this.zone.run(() => {
        this.liveActivityLog = [entry, ...this.liveActivityLog.slice(0, 4)];
        if (entry.type === 'email')   this.liveEmailCount++;
        if (entry.type === 'reply')   this.liveReplyCount++;
        if (entry.type === 'meeting') this.liveMeetingCount++;
      });
    }, 2800);
  }

  // ── Testimonial Rotation ──────────────────────────────
  private startTestimonialRotation(): void {
    this.testimonialTimer = setInterval(() => {
      this.zone.run(() => {
        this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      });
    }, 4500);
  }

  // ── Scroll Reveal ─────────────────────────────────────
  private setupScrollAnimations(): void {
    const options = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (entry.target.classList.contains('stats-bar') && !this.counterAnimated) {
            this.counterAnimated = true;
            this.zone.run(() => this.animateCounters());
          }
        }
      });
    }, options);
    setTimeout(() => {
      const sections = this.el.nativeElement.querySelectorAll('.reveal-on-scroll');
      sections.forEach((s: Element) => this.observer!.observe(s));
    }, 150);
  }

  private animateCounters(): void {
    this.animateValue('animatedDomains',   120,  1200);
    this.animateValue('animatedEmails',   5000,  1600);
    this.animateValue('animatedReplyRate',   28,  1000);
    this.animateValue('animatedMeetings',  340,  1400);
  }

  private animateValue(
    prop: 'animatedDomains'|'animatedEmails'|'animatedReplyRate'|'animatedMeetings',
    target: number, duration: number
  ): void {
    const steps = 50;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current++;
      this[prop] = Math.round((current / steps) * target);
      if (current >= steps) { this[prop] = target; clearInterval(timer); }
    }, stepTime);
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  // ── Three.js — Particle Network ───────────────────────
  private initThreeJS(): void {
    const canvas = this.threeCanvas?.nativeElement;
    if (!canvas) return;

    this.clock    = new THREE.Clock();
    this.scene    = new THREE.Scene();
    this.camera   = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.z = 28;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setClearColor(0x000000, 0);

    // Nodes
    const nodeCount = 55;
    const geom  = new THREE.SphereGeometry(0.22, 8, 8);
    const mat   = new THREE.MeshBasicMaterial({ color: 0x25a39d });
    const matHi = new THREE.MeshBasicMaterial({ color: 0xd7a449 });

    for (let i = 0; i < nodeCount; i++) {
      const mesh = new THREE.Mesh(geom, i % 8 === 0 ? matHi : mat);
      mesh.position.set(
        (Math.random() - 0.5) * 44,
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 20
      );
      this.scene.add(mesh);
      this.nodes.push(mesh);
      this.nodeVels.push({
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.006,
      });
    }

    // Lines geometry (pre-allocated)
    const maxLines = nodeCount * nodeCount;
    const linePosArr = new Float32Array(maxLines * 6);
    const lineGeo  = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePosArr, 3));
    const lineMat  = new THREE.LineBasicMaterial({ color: 0x1d7874, transparent: true, opacity: 0.35 });
    this.linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    this.scene.add(this.linesMesh);

    window.addEventListener('resize', () => this.onResize());
  }

  private animateThreeJS(): void {
    this.animFrameId = requestAnimationFrame(() => this.animateThreeJS());
    const t = this.clock.getElapsedTime();

    // Move nodes
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const v = this.nodeVels[i];
      n.position.x += v.x;
      n.position.y += v.y;
      n.position.z += v.z;
      if (Math.abs(n.position.x) > 22) v.x *= -1;
      if (Math.abs(n.position.y) > 14) v.y *= -1;
      if (Math.abs(n.position.z) > 10) v.z *= -1;
    }

    // Update lines
    const threshold = 9;
    const positions = (this.linesMesh.geometry.attributes['position'] as THREE.BufferAttribute).array as Float32Array;
    let idx = 0;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const d = this.nodes[i].position.distanceTo(this.nodes[j].position);
        if (d < threshold && idx + 6 < positions.length) {
          positions[idx++] = this.nodes[i].position.x;
          positions[idx++] = this.nodes[i].position.y;
          positions[idx++] = this.nodes[i].position.z;
          positions[idx++] = this.nodes[j].position.x;
          positions[idx++] = this.nodes[j].position.y;
          positions[idx++] = this.nodes[j].position.z;
        }
      }
    }
    // Zero out unused
    for (let k = idx; k < positions.length; k++) positions[k] = 0;
    (this.linesMesh.geometry.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
    this.linesMesh.geometry.setDrawRange(0, idx / 3);

    // Subtle camera drift
    this.camera.position.x += (this.mouseX * 2  - this.camera.position.x) * 0.015;
    this.camera.position.y += (-this.mouseY * 1.5 - this.camera.position.y) * 0.015;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    const canvas = this.threeCanvas?.nativeElement;
    if (!canvas || !this.renderer) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

