import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const origPath = path.join(process.cwd(), 'design_template', 'edubost-reference', 'img', 'hero', 'hero_img01.png');
    const targetPath = path.join(process.cwd(), 'public', 'edubost-reference', 'img', 'hero', 'hero_img01.png');

    if (fs.existsSync(origPath)) {
      fs.copyFileSync(origPath, targetPath);
      return NextResponse.json({ success: true, message: 'Reverted hero_img01.png to original template image.' });
    } else {
      return NextResponse.json({ success: false, error: 'Original image not found in design_template' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
