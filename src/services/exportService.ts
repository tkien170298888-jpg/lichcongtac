import { ScheduleItem, TaskItem } from '../types';

export function exportToWordDocument(schedules: ScheduleItem[], weekNumber: number, year: number, isOfficial: boolean = true) {
  const approvedSchedules = schedules
    .filter(s => s.weekNumber === weekNumber && (s.status === 'approved' || isOfficial === false))
    .sort((a, b) => {
      const dayOrder = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
      const d1 = dayOrder.indexOf(a.dayOfWeek);
      const d2 = dayOrder.indexOf(b.dayOfWeek);
      if (d1 !== d2) return d1 - d2;
      if (a.session !== b.session) return a.session === 'Sáng' ? -1 : 1;
      return a.time.localeCompare(b.time);
    });

  // Generate table rows HTML
  const rowsHtml = approvedSchedules.map((item) => `
    <tr>
      <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top; font-weight: bold;">
        ${item.dayOfWeek}<br/><span style="font-weight: normal; font-size: 11pt;">${item.date}</span>
      </td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top; font-weight: bold;">
        ${item.session}
      </td>
      <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
        <b>- ${item.time}:</b> ${item.content}
      </td>
      <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top; font-weight: bold;">
        ${item.host}
      </td>
      <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
        ${item.attendees}
      </td>
      <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">
        ${item.location}
      </td>
      <td style="border: 1px solid #000; padding: 6px; vertical-align: top; font-style: italic;">
        ${item.notes || ''}
      </td>
    </tr>
  `).join('');

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Lịch Công Tác Tuần ${weekNumber}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.3; }
        table { border-collapse: collapse; width: 100%; }
        th { border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; background-color: #f2f2f2; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
      </style>
    </head>
    <body>
      <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
          <td style="width: 45%; text-align: center; vertical-align: top;">
            <b>HĐND VÀ UBND XÃ LAO BẢO</b><br/>
            <b>VĂN PHÒNG HĐND & UBND</b><br/>
            ----------------
          </td>
          <td style="width: 55%; text-align: center; vertical-align: top;">
            <b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br/>
            <b><u>Độc lập - Tự do - Hạnh phúc</u></b><br/>
            <span style="font-style: italic; font-size: 11pt;">Lao Bảo, ngày 05 tháng 10 năm 2026</span>
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin: 25px 0 15px 0;">
        <h2 style="margin: 0; font-size: 15pt; color: #b91c1c; text-transform: uppercase;">
          LỊCH CÔNG TÁC TUẦN ${weekNumber}
        </h2>
        <h3 style="margin: 4px 0; font-size: 13pt; color: #1e3a8a; text-transform: uppercase;">
          CỦA LÃNH ĐẠO HĐND VÀ UBND XÃ LAO BẢO ${isOfficial ? '(Chính thức)' : '(Dự thảo lấy ý kiến)'}
        </h3>
        <p style="margin: 4px 0; font-style: italic; font-size: 12pt;">
          Từ ngày 05/10/2026 đến ngày 09/10/2026
        </p>
        <p style="margin: 2px 0;">*****</p>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 10%;">Thứ ngày</th>
            <th style="width: 8%;">Buổi</th>
            <th style="width: 32%;">Nội dung công việc</th>
            <th style="width: 10%;">Chủ trì</th>
            <th style="width: 18%;">Tham dự</th>
            <th style="width: 14%;">Địa điểm</th>
            <th style="width: 8%;">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <p style="font-style: italic; font-size: 11pt; margin-top: 15px;">
        <b>Ghi chú:</b> Một số nội dung phiên họp, làm việc khi lịch có bổ sung, đề nghị các phòng, ban, trung tâm có liên quan tham mưu kịp thời giấy mời, chuẩn bị nội dung, chương trình chu đáo, theo đúng chỉ đạo của đồng chí lãnh đạo UBND xã trực tiếp chủ trì.
      </p>

      <table style="width: 100%; border: none; margin-top: 30px;">
        <tr>
          <td style="width: 50%; vertical-align: top; font-size: 11pt;">
            <b><i>Nơi nhận:</i></b><br/>
            - Thường trực Đảng ủy (b/c);<br/>
            - TT HĐND, UBND xã (chỉ đạo);<br/>
            - Các ban ngành, đoàn thể xã;<br/>
            - Các thôn, bản trên địa bàn;<br/>
            - Lưu: VT, VP HĐND&UBND.
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <b>TM. THƯỜNG TRỰC UBND XÃ</b><br/>
            <b>CHỦ TỊCH</b><br/><br/><br/><br/>
            <b>Nguyễn Văn Vũ</b>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lich_Cong_Tac_Tuan_${weekNumber}_UBND_Xa_Lao_Bao.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToExcel(schedules: ScheduleItem[], weekNumber: number) {
  const weekItems = schedules
    .filter(s => s.weekNumber === weekNumber && s.status === 'approved')
    .sort((a, b) => {
      const dayOrder = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
      const d1 = dayOrder.indexOf(a.dayOfWeek);
      const d2 = dayOrder.indexOf(b.dayOfWeek);
      if (d1 !== d2) return d1 - d2;
      if (a.session !== b.session) return a.session === 'Sáng' ? -1 : 1;
      return a.time.localeCompare(b.time);
    });

  const rowsXml = weekItems.map(item => `
    <tr>
      <td style="border: 1px solid #999; text-align: center; vertical-align: top; font-weight: bold;">${item.dayOfWeek}</td>
      <td style="border: 1px solid #999; text-align: center; vertical-align: top;">${item.date}</td>
      <td style="border: 1px solid #999; text-align: center; vertical-align: top; font-weight: bold;">${item.session}</td>
      <td style="border: 1px solid #999; text-align: center; vertical-align: top; font-weight: bold; color: #b91c1c;">${item.time}</td>
      <td style="border: 1px solid #999; vertical-align: top;">${item.content}</td>
      <td style="border: 1px solid #999; text-align: center; vertical-align: top; font-weight: bold; color: #1e3a8a;">${item.host}</td>
      <td style="border: 1px solid #999; vertical-align: top;">${item.attendees}</td>
      <td style="border: 1px solid #999; vertical-align: top;">${item.location}</td>
      <td style="border: 1px solid #999; vertical-align: top; font-style: italic;">${item.notes || ''}</td>
      <td style="border: 1px solid #999; vertical-align: top;">${item.department}</td>
      <td style="border: 1px solid #999; text-align: center; vertical-align: top; color: #047857; font-weight: bold;">Chính thức</td>
    </tr>
  `).join('');

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Lich_Tuan_${weekNumber}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Times New Roman', Arial, sans-serif; font-size: 11pt; }
        table { border-collapse: collapse; }
        th { background-color: #b91c1c; color: #ffffff; border: 1px solid #000; padding: 8px 6px; font-weight: bold; text-align: center; }
        td { padding: 6px; }
      </style>
    </head>
    <body>
      <table style="width: 100%;">
        <tr>
          <td colspan="4" style="font-weight: bold; font-size: 11pt; text-align: center;">HĐND VÀ UBND XÃ LAO BẢO</td>
          <td colspan="7" style="font-weight: bold; font-size: 11pt; text-align: center;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</td>
        </tr>
        <tr>
          <td colspan="4" style="font-weight: bold; font-size: 10pt; text-align: center;">VĂN PHÒNG HĐND & UBND</td>
          <td colspan="7" style="font-weight: bold; font-size: 10pt; text-align: center;">Độc lập - Tự do - Hạnh phúc</td>
        </tr>
        <tr><td colspan="11"></td></tr>
        <tr>
          <td colspan="11" style="font-weight: bold; font-size: 14pt; color: #b91c1c; text-align: center;">
            LỊCH CÔNG TÁC TUẦN ${weekNumber} CỦA LÃNH ĐẠO HĐND VÀ UBND XÃ LAO BẢO (CHÍNH THỨC)
          </td>
        </tr>
        <tr><td colspan="11"></td></tr>
        <thead>
          <tr>
            <th style="width: 80px;">Thứ</th>
            <th style="width: 90px;">Ngày</th>
            <th style="width: 60px;">Buổi</th>
            <th style="width: 70px;">Giờ</th>
            <th style="width: 320px;">Nội dung công việc</th>
            <th style="width: 110px;">Chủ trì</th>
            <th style="width: 250px;">Thành phần tham dự</th>
            <th style="width: 160px;">Địa điểm</th>
            <th style="width: 120px;">Ghi chú</th>
            <th style="width: 120px;">Đơn vị tham mưu</th>
            <th style="width: 90px;">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          ${rowsXml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', excelHtml], { 
    type: 'application/vnd.ms-excel;charset=utf-8' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lich_Cong_Tac_Tuan_${weekNumber}_UBND_Lao_Bao.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateZaloMessage(schedules: ScheduleItem[], weekNumber: number): string {
  const weekList = schedules.filter(s => s.weekNumber === weekNumber && s.status === 'approved');
  
  let msg = `🏛️ LỊCH CÔNG TÁC TUẦN ${weekNumber} - LÃNH ĐẠO HĐND & UBND XÃ LAO BẢO\n`;
  msg += `📅 Từ ngày 05/10/2026 đến ngày 09/10/2026\n`;
  msg += `------------------------------------\n\n`;

  const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'];
  
  days.forEach(day => {
    const dayItems = weekList.filter(item => item.dayOfWeek === day);
    if (dayItems.length > 0) {
      msg += `📌 ${day.toUpperCase()} (${dayItems[0].date}):\n`;
      dayItems.forEach(item => {
        msg += `  ⏰ ${item.session} [${item.time}]: ${item.content}\n`;
        msg += `     👤 Chủ trì: ${item.host}\n`;
        msg += `     📍 Địa điểm: ${item.location}\n`;
        if (item.notes) msg += `     💡 Lưu ý: ${item.notes}\n`;
        msg += `\n`;
      });
    }
  });

  msg += `⚠️ Đề nghị các phòng ban chuẩn bị kỹ tài liệu và tham dự đúng giờ.\n`;
  msg += `🔗 Tra cứu trực tuyến tại: Cổng thông tin điều hành nội bộ xã`;

  return msg;
}

export function openEmailShare(schedules: ScheduleItem[], weekNumber: number) {
  const subject = encodeURIComponent(`[UBND XÃ LAO BẢO] Lịch công tác tuần ${weekNumber} của Lãnh đạo UBND xã`);
  const body = encodeURIComponent(generateZaloMessage(schedules, weekNumber));
  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
}
