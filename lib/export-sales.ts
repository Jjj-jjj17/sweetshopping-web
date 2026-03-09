import * as XLSX from 'xlsx'

export function exportSalesReport(orders: any[]) {
    const data = orders.map(order => ({
        '訂單編號': order.id,
        '客戶姓名': order.customer_name,
        'Email': order.customer_email,
        '電話': order.customer_phone,
        '取貨門市': order.delivery_address,
        '金額': order.total,
        '狀態': order.status,
        '訂單時間': new Date(order.created_at).toLocaleString('zh-TW'),
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '訂單報表')

    const date = new Date().toISOString().split('T')[0]
    const filename = `訂單報表_${date}.xlsx`

    XLSX.writeFile(wb, filename)
}
