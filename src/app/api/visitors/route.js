import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// In-memory persistent cache for serverless environments
let memoryStore = {
  total: 0,
  days: {}, // { '2026-10-12': ['iphash1', 'iphash2'] }
  seenIps: {} // { 'iphash1': '2026-10-12' }
};

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'visitors.json');

// Helper to get today's date in WIB (Asia/Jakarta, GMT+7)
function getTodayDateWIB() {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

// Anonymize IP to comply with "tanpa menyimpan alamat IP asli"
function hashIp(ip) {
  const salt = 'kulino_pit_wib_salt_2026';
  return crypto.createHash('sha256').update((ip || '127.0.0.1') + salt).digest('hex').substring(0, 16);
}

// Helper to safely load data
function loadVisitorData() {
  try {
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.total === 'number') {
        memoryStore.total = parsed.total;
        memoryStore.days = parsed.days || {};
        memoryStore.seenIps = parsed.seenIps || parsed.ips || {};
      }
    }
  } catch (err) {
    // If filesystem is not writable or error, memoryStore retains state
  }
  return memoryStore;
}

// Helper to safely persist data
function saveVisitorData(data) {
  memoryStore = data;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    // Graceful fallback for read-only environments
  }
}

// GET: Read current visitor stats without incrementing
export async function GET() {
  try {
    const data = loadVisitorData();
    const today = getTodayDateWIB();
    const todayCount = (data.days && data.days[today]) ? data.days[today].length : 0;
    
    return NextResponse.json({
      total: data.total,
      today: todayCount,
      date: today
    });
  } catch (error) {
    return NextResponse.json({ total: 0, today: 0, error: error.message }, { status: 500 });
  }
}

// POST: Record visit (Counts max 1 IP per day)
export async function POST(req) {
  try {
    // 1. Get Real IP from Request Headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip');
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : (realIp || cfIp || '127.0.0.1');

    // 2. Anonymize IP via SHA-256 hash
    const ipHash = hashIp(rawIp);
    const today = getTodayDateWIB();

    // 3. Load latest data
    const data = loadVisitorData();
    if (!data.days) data.days = {};
    if (!data.seenIps) data.seenIps = {};
    if (!Array.isArray(data.days[today])) data.days[today] = [];

    // 4. Check if this IP has already been counted today
    const lastSeenDate = data.seenIps[ipHash];
    const isNewVisitorToday = lastSeenDate !== today;

    if (isNewVisitorToday) {
      data.seenIps[ipHash] = today;
      data.days[today].push(ipHash);
      data.total = (data.total || 0) + 1;
      saveVisitorData(data);
    }

    const todayCount = data.days[today].length;

    return NextResponse.json({
      total: data.total,
      today: todayCount,
      isNewVisitToday: isNewVisitorToday,
      date: today
    });
  } catch (error) {
    return NextResponse.json({ total: 0, today: 0, error: error.message }, { status: 500 });
  }
}
