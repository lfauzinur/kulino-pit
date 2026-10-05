import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data');
const file = path.join(dataPath, 'visitors.json');

export async function GET(req) {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify({ total: 1139, ips: {} }));
    }
    
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    const today = new Date().toISOString().split('T')[0];
    const todayCount = Object.values(data.ips).filter(date => date === today).length;
    
    return NextResponse.json({ 
      total: data.total, 
      today: todayCount || 22 
    });
  } catch (error) {
    return NextResponse.json({ total: 1140, today: 22 });
  }
}

export async function POST(req) {
  try {
    // Get IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const today = new Date().toISOString().split('T')[0];
    
    if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ total: 1139, ips: {} }));
    
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    if (data.ips[ip] !== today) {
      data.ips[ip] = today;
      data.total += 1;
      fs.writeFileSync(file, JSON.stringify(data));
    }
    
    const todayCount = Object.values(data.ips).filter(date => date === today).length;
    return NextResponse.json({ total: data.total, today: todayCount });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
