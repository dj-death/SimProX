import chartModel = require('../../models/simulation/Chart');
import userRoleModel = require('../../models/user/UserRole');

import logger = require('../../../kernel/utils/logger');

let util = require('util');


export function getChart(req, res, next) {
    let seminarId = req.gameMarksimos.currentStudentSeminar.seminarId;

    if (req.user.role !== userRoleModel.roleList.student.id) {
        seminarId = +req.query.seminarId;
    }

    if (!seminarId) {
        return res.status(400).send({ message: "You don't choose a seminar." });
    }

    let chartName = req.params.chart_name;
    let companyId = +req.query.companyId;

    if (!chartName) {
        return res.status(400).send({ message: 'chartName cannot be empty.' });
    }

    //chart name saved in db doesn't contain _
    let chartNameTemp = chartName.replace(/_/g, '');

    chartModel.findOne(seminarId).then(function (result) {
        if (!result) {
            return res.status(400).send({ message: util.format("chart %s does not exist.", chartName) });
        }

        let allCharts = result.charts;
        let chart = null;
        for (let i = 0; i < allCharts.length; i++) {
            //find chart data by chart name
            if (allCharts[i].chartName.toLowerCase() === chartNameTemp.toLowerCase()) {
                chart = allCharts[i];
                break;
            }
        }

        if (!chart) {
            return res.status(400).send({ message: util.format("chart %s does not exist.", chartName) });
        }

        if (req.user.role === userRoleModel.roleList.student.id && chartName === 'inventory_report') {
            //this function changes data in chart object
            let chartData = filterChart(chart, companyId);
            return res.send(chartData);
        }
        res.send(chart.chartData);
    })
        .fail(function (err) {
            logger.error(err);
            res.status(500).send({ message: "get chart failed." })
        })
        .done();

    /**
     * chart contains data of all the companies, 
     * this function removes chart data of other companies from chart
     *
     * @param {Object} chart chartData got from db
     {
        chartName: "inventoryReport",
        chartData: []
     }
     * @param {Number} companyId
     */
    function filterChart(chart, companyId) {
        if (!chart || !companyId) {
            throw new Error("invalid parameter chart or invalid parameter companyId");
        }

        let chartData = chart.chartData;
        let chartOfCurrentCompany;
        for (let j = 0; j < chartData.length; j++) {
            if (chartData[j].companyId === companyId) {
                chartOfCurrentCompany = chartData[j];
                break;
            }
        }
        if (chartOfCurrentCompany) {
            return chartOfCurrentCompany;
        }
    }
};
