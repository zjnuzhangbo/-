import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { InvoiceItem } from '../types';

export function exportExcel(items: InvoiceItem[], totalAmount: number, customerName: string) {
  const data = items.map((item) => ({
    '产品名称': item.productName,
    '型号': item.model,
    '规格': item.spec,
    '数量': item.quantity,
    '单价': item.unitPrice,
    '小计': item.subtotal,
  }));

  data.push({ '产品名称': '合计', '型号': '', '规格': '', '数量': 0 as any, '单价': 0 as any, '小计': totalAmount });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '货单');

  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `${customerName}-${date}-${time}.xlsx`;

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}
