import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import type { InvoiceItem } from '../types';

export async function exportWord(items: InvoiceItem[], totalAmount: number, customerName: string) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headerCells = ['产品名称', '型号', '规格', '数量', '单价', '小计'].map(
    (text) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20 })] })],
        width: { size: 1500, type: WidthType.DXA },
        borders,
      })
  );

  const rows = items.map(
    (item) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.productName, size: 20 })] })], borders }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.model, size: 20 })] })], borders }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.spec, size: 20 })] })], borders }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(item.quantity), size: 20 })] })], borders }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `¥${item.unitPrice.toFixed(2)}`, size: 20 })] })], borders }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `¥${item.subtotal.toFixed(2)}`, size: 20 })] })], borders }),
        ],
      })
  );

  const totalRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '合计', bold: true, size: 20 })] })], borders, columnSpan: 5 }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `¥${totalAmount.toFixed(2)}`, bold: true, size: 20 })] })], borders }),
    ],
  });

  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: `货单 — ${customerName} — ${date}`, bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Table({
            rows: [new TableRow({ children: headerCells }), ...rows, totalRow],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `${customerName}-${date}-${time}.docx`);
}
