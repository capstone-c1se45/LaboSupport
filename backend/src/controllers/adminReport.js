import { adminReportModel } from "../models/adminReport.js";
import { reportModel } from "../models/report.js";

export const adminReportController = {
  async getReport(req, res) {
    try {
      const [
        overview,
        byRole,
        byMonth,
        byGender,
        byOccupation,
        byAddress,
        totalContracts,
        totalReports,
        totalMessages,
        contractsByMonth,
        messagesByMonth
      ] = await Promise.all([
        adminReportModel.getUserOverview(),
        adminReportModel.getUserByRole(),
        adminReportModel.getUserByMonth(),
        adminReportModel.getUserByGender(),
        adminReportModel.getUserByOccupation(),
        adminReportModel.getUserByAddress(),
        adminReportModel.getTotalContracts(),
        adminReportModel.getTotalReports(),
        adminReportModel.getTotalMessages(),
        adminReportModel.getContractsByMonth(),
        adminReportModel.getMessagesByMonth()
      ]);

      res.status(200).json({
        overview: {
            ...overview,
            totalContracts,
            totalReports,
            totalMessages
        },
        byRole,
        byMonth,
        byGender,
        byOccupation,
        byAddress,
        contractsByMonth,
        messagesByMonth
      });
    } catch (error) {
      console.error("Error getReport:", error);
      res.status(500).json({ message: "Lỗi khi lấy báo cáo admin." });
    }
  },

  async updateReportStatus(req, res) {
    try {
        const { reportId } = req.params;
        const { status, adminResponse } = req.body; 

        const report = await reportModel.getReportById(reportId);
        
        if (report) {
            if (req.io) {
                req.io.to(`user_${report.user_id}`).emit('REPORT_STATUS_UPDATED', {
                    report_id: reportId,
                    status: status,
                    admin_response: adminResponse,
                    message: `Admin đã cập nhật trạng thái báo cáo của bạn thành: ${status}`
                });
                
                req.io.to(`user_${report.user_id}`).emit('NOTIFICATION', {
                    type: 'REPORT_UPDATE',
                    title: 'Cập nhật báo cáo',
                    message: `Admin đã phản hồi báo cáo #${reportId} của bạn.`,
                    link: '/report',
                    isRead: false
                });
            }
        }

        res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi Server" });
    }
  }
};