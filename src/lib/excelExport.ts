import * as XLSX from 'xlsx'
import { WarehouseReport, SupplyChainStatus } from '@/types'

export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export const exportWarehouseReports = (reports: WarehouseReport[]) => {
  const statusMap: Record<string, string> = {
    'in_stock': 'Còn hàng',
    'low_stock': 'Sắp hết',
    'out_of_stock': 'Hết hàng',
    'overstock': 'Tồn kho cao',
  }
  
  const data = reports.map((report) => ({
    'Tên sản phẩm': report.product.name,
    'SKU': report.product.sku,
    'Danh mục': report.product.category,
    'Tồn kho hiện tại': report.currentStock,
    'Tồn kho tối thiểu': report.minStock,
    'Tồn kho tối đa': report.maxStock,
    'Trạng thái': statusMap[report.status] || report.status,
    'Vị trí': report.location,
    'Cập nhật lần cuối': new Date(report.lastMovement).toLocaleDateString('vi-VN'),
  }))
  exportToExcel(data, `bao-cao-kho-${new Date().toISOString().split('T')[0]}`)
}

export const exportSupplyChain = (supplyChain: SupplyChainStatus[]) => {
  const statusMap: Record<string, string> = {
    'pending': 'Chờ xử lý',
    'in_transit': 'Đang vận chuyển',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy',
  }
  
  const data = supplyChain.map((item) => ({
    'Mã đơn hàng': item.orderId,
    'Tên sản phẩm': item.product.name,
    'SKU': item.product.sku,
    'Trạng thái': statusMap[item.status] || item.status,
    'Nhà cung cấp': item.supplier,
    'Số lượng': item.quantity,
    'Ngày đặt hàng': new Date(item.orderDate).toLocaleDateString('vi-VN'),
    'Ngày dự kiến': new Date(item.expectedDate).toLocaleDateString('vi-VN'),
    'Ngày thực tế': item.actualDate ? new Date(item.actualDate).toLocaleDateString('vi-VN') : 'Chưa có',
    'Ghi chú': item.notes || '',
  }))
  exportToExcel(data, `chuoi-cung-ung-${new Date().toISOString().split('T')[0]}`)
}

export const exportDashboard = (stats: any, reports: WarehouseReport[], supplyChain: SupplyChainStatus[]) => {
  const workbook = XLSX.utils.book_new()
  
  const statusMapWarehouse: Record<string, string> = {
    'in_stock': 'Còn hàng',
    'low_stock': 'Sắp hết',
    'out_of_stock': 'Hết hàng',
    'overstock': 'Tồn kho cao',
  }
  
  const statusMapSupplyChain: Record<string, string> = {
    'pending': 'Chờ xử lý',
    'in_transit': 'Đang vận chuyển',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy',
  }
  
  // Stats sheet
  const statsData = [
    { 'Chỉ số': 'Tổng sản phẩm', 'Giá trị': stats.totalProducts },
    { 'Chỉ số': 'Tổng tồn kho', 'Giá trị': stats.totalInventoryValue },
    { 'Chỉ số': 'Sản phẩm sắp hết', 'Giá trị': stats.lowStockItems },
    { 'Chỉ số': 'Đơn hàng chờ xử lý', 'Giá trị': stats.pendingOrders },
    { 'Chỉ số': 'Đơn hàng đang vận chuyển', 'Giá trị': stats.inTransitOrders },
    { 'Chỉ số': 'Đơn hàng đã giao', 'Giá trị': stats.deliveredOrders },
  ]
  const statsSheet = XLSX.utils.json_to_sheet(statsData)
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Thống kê')
  
  // Warehouse Reports sheet
  const reportsData = reports.map((report) => ({
    'Tên sản phẩm': report.product.name,
    'SKU': report.product.sku,
    'Tồn kho hiện tại': report.currentStock,
    'Trạng thái': statusMapWarehouse[report.status] || report.status,
    'Vị trí': report.location,
  }))
  const reportsSheet = XLSX.utils.json_to_sheet(reportsData)
  XLSX.utils.book_append_sheet(workbook, reportsSheet, 'Báo cáo kho')
  
  // Supply Chain sheet
  const supplyChainData = supplyChain.map((item) => ({
    'Mã đơn hàng': item.orderId,
    'Sản phẩm': item.product.name,
    'Trạng thái': statusMapSupplyChain[item.status] || item.status,
    'Nhà cung cấp': item.supplier,
    'Số lượng': item.quantity,
  }))
  const supplyChainSheet = XLSX.utils.json_to_sheet(supplyChainData)
  XLSX.utils.book_append_sheet(workbook, supplyChainSheet, 'Chuỗi cung ứng')
  
  XLSX.writeFile(workbook, `bao-cao-tong-hop-${new Date().toISOString().split('T')[0]}.xlsx`)
}


