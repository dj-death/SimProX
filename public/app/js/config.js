/**
 * Created by jinwyp on 6/26/14.
 */

/**
 * recommended
 *
 * no globals are left behind
 */


(function () {
    'use strict';

    angular.module('marksimos.config', ['LocalStorageModule']);
    angular.module('b2c.config', ['LocalStorageModule']);


    /********************  解决提交请求$http 时出现 "Provisional headers are shown angular"(实际上并没有采用,而是后端出的问题导致了该问题) ********************/
    /********************  http://stackoverflow.com/questions/21630534/node-js-angular-js-caution-provisional-headers-are-shown ********************/

    angular.module('marksimos.config').factory('marksimosInterceptor', ['$log', '$q', '$window', 'localStorageService', function($log, $q, $window, localStorageService) {
        //$log.debug('$log is here to show you that this is a regular factory with injection');

        return {
            'request': function (config) {
                config.headers = config.headers || {};

                var token = localStorageService.get('logintoken');

                if (token) {
                   config.headers['x-access-token'] = token;
                }

                return config;
            },

            'responseError': function(response) {
                //console.log(response);
                if(response.status === 401) {
                    //$window.location.href = '/marksimos';
                }
                return $q.reject(response);
            }
        };
    }]);



    angular.module('b2c.config').factory('b2cInterceptor', ['$log', '$q', '$window', 'localStorageService', function($log, $q, $window, localStorageService) {
        //$log.debug('$log is here to show you that this is a regular factory with injection');

        return {
            'request': function (config) {
                config.headers = config.headers || {};

                var token = localStorageService.get('logintoken');

                if (token) {
                    config.headers['x-access-token'] = token;
                }

                return config;
            },

            'responseError': function(response) {
                //console.log(response);
                if(response.status === 401 || response.status === 403) {
                    //$window.location.href = '/e4e/login';
                }
                return $q.reject(response);
            }
        };
    }]);





    //angular.module('marksimos.config').config(['$httpProvider', function ($httpProvider) {
    //    //Reset headers to avoid OPTIONS request (aka preflight)
    //    $httpProvider.defaults.headers.common = {};
    //    $httpProvider.defaults.headers.post = {};
    //    $httpProvider.defaults.headers.put = {};
    //    $httpProvider.defaults.headers.patch = {};
    //}]);


    angular.module('marksimos.config').config(['$httpProvider', 'localStorageServiceProvider', '$locationProvider', function ($httpProvider, localStorageServiceProvider, $locationProvider ) {
        localStorageServiceProvider.setPrefix('stratege');
        localStorageServiceProvider.setStorageType('localStorage');  // Or sessionStorage
        localStorageServiceProvider.setNotify(true, true);

        $httpProvider.interceptors.push('marksimosInterceptor');

        $locationProvider.html5Mode(false).hashPrefix('!');

    }]);


    angular.module('b2c.config').config(['$httpProvider', 'localStorageServiceProvider', '$locationProvider', function ($httpProvider, localStorageServiceProvider, $locationProvider ) {
        localStorageServiceProvider.setPrefix('hcdlearning');
        localStorageServiceProvider.setStorageType('localStorage');  // Or sessionStorage
        localStorageServiceProvider.setNotify(true, true);

        $httpProvider.interceptors.push('b2cInterceptor');

        $locationProvider.html5Mode(false).hashPrefix('!');

    }]);

    angular.module('b2c.config').constant('Constant',
    {
        language : [
            {
                id : 1000, name : 'LanguageChinese', shortName : 'ZH'
            },
            {
                id : 1010, name : 'LanguageEnglish', shortName : 'EN'
            },
            {
                id : 1020, name : 'LanguageFrench', shortName : 'FR'
            },
            {
                id : 1030, name : 'LanguageGerman', shortName : 'DE'
            },
            {
                id : 1040, name : 'LanguageGreek', shortName : 'EL'
            },
            {
                id : 1050, name : 'LanguageHindi', shortName : 'HI'
            },
            {
                id : 1060, name : 'LanguageItalian', shortName : 'IT'
            },
            {
                id : 1070, name : 'LanguageJapanese', shortName : 'JA'
            },
            {
                id : 1080, name : 'LanguageKorean', shortName : 'KO'
            },
            {
                id : 1090, name : 'LanguageRussian', shortName : 'RU'
            },
            {
                id : 1100, name : 'LanguageSpanish', shortName : 'ES'
            },
            {
                id : 1110, name : 'LanguageSwedish', shortName : 'SV'
            },
            {
                id : 1120, name : 'LanguageTibetan', shortName : 'BO'
            },
            {
                id : 1130, name : 'LanguageTurkish', shortName : 'TR'
            },
            {
                id : 1140, name : 'LanguageUkrainian', shortName : 'UZ'
            }
        ],

        languageProficiency : [
            { id: 10, name : 'LanguageBeginner'},
            { id: 20, name : 'LanguageIntermediate'},
            { id: 30, name : 'LanguageFluent'},
            { id: 40, name : 'LanguageNative'}
        ],

        educationDegree : [
            { id: '10', name : 'educationDegreeSeniorHighSchool'},
            { id: '20', name : 'educationDegreeJuniorCollege'},
            { id: '30', name : 'educationDegreeBachelor'},
            { id: '40', name : 'educationDegreeMaster'},
            { id: '50', name : 'educationDegreeMBA'},
            { id: '60', name : 'educationDegreeDoctor'},
            { id: '70', name : 'educationDegreeOther'}
        ],

        educationMajor : [
            { id: 1100, name : 'educationMajorPhilosophy', children:
                [
                    {id:1105, name : 'educationMajorPhilosophy01'}
                ]
            },
            { id: 1200, name : 'educationMajorEconomics', children:
                [
                    {id:1205, name : 'educationMajorEconomics01'}
                ]
            },
            { id: 1300, name : 'educationMajorManagement', children:
                [
                    {id:1305, name : 'educationMajorManagement01'},
                    {id:1310, name : 'educationMajorManagement02'},
                    {id:1315, name : 'educationMajorManagement03'},
                    {id:1320, name : 'educationMajorManagement04'}
                ]
            },
            { id: 1400, name : 'educationMajorLiterature', children:
                [
                    {id:1405, name : 'educationMajorLiterature01'},
                    {id:1410, name : 'educationMajorLiterature02'},
                    {id:1415, name : 'educationMajorLiterature03'}
                ]
            },
            { id: 1500, name : 'educationMajorEngineering', children:
                [
                    {id:1505, name : 'educationMajorEngineering01'},
                    {id:1510, name : 'educationMajorEngineering02'},
                    {id:1515, name : 'educationMajorEngineering03'},
                    {id:1520, name : 'educationMajorEngineering04'},
                    {id:1525, name : 'educationMajorEngineering05'},
                    {id:1530, name : 'educationMajorEngineering06'},
                    {id:1535, name : 'educationMajorEngineering07'},
                    {id:1540, name : 'educationMajorEngineering08'},
                    {id:1545, name : 'educationMajorEngineering09'},
                    {id:1550, name : 'educationMajorEngineering10'},
                    {id:1555, name : 'educationMajorEngineering11'},
                    {id:1560, name : 'educationMajorEngineering12'},
                    {id:1565, name : 'educationMajorEngineering13'},
                    {id:1570, name : 'educationMajorEngineering14'},
                    {id:1575, name : 'educationMajorEngineering16'},
                    {id:1580, name : 'educationMajorEngineering17'}
                ]
            },
            { id: 1600, name : 'educationMajorLaw', children:
                [
                    {id:1605, name : 'educationMajorLaw01'}
                ]
            },
            { id: 1700, name : 'educationMajorHistory', children:
                [
                    {id:1705, name : 'educationMajorHistory01'}
                ]
            },
            { id: 1800, name : 'educationMajorScience', children:
                [
                    {id:1805, name : 'educationMajorScience01'},
                    {id:1810, name : 'educationMajorScience02'},
                    {id:1815, name : 'educationMajorScience03'},
                    {id:1820, name : 'educationMajorScience04'},
                    {id:1825, name : 'educationMajorScience05'},
                    {id:1830, name : 'educationMajorScience06'},
                    {id:1835, name : 'educationMajorScience07'},
                    {id:1840, name : 'educationMajorScience08'},
                    {id:1845, name : 'educationMajorScience09'},
                ]
            },
            { id: 1900, name : 'educationMajorEducation', children:
                [
                    {id:1905, name : 'educationMajorEducation01'}
                ]
            },
            { id: 2000, name : 'educationMajorMedicine', children:
                [
                    {id:2005, name : 'educationMajorMedicine01'},
                    {id:2010, name : 'educationMajorMedicine02'}
                ]
            },
            { id: 2100, name : 'educationMajorAgriculture', children:
                [
                    {id:2105, name : 'educationMajorAgriculture01'}
                ]
            }

        ],

        societyExperiencesPosition : [
            { id: 10, name : 'societyExperiencesPositionChairman'},
            { id: 20, name : 'societyExperiencesPositionViceChairman'},
            { id: 30, name : 'societyExperiencesPositionMinister'},
            { id: 40, name : 'societyExperiencesPositionViceMinister'},
            { id: 50, name : 'societyExperiencesPositionTeamLeader'},
            { id: 60, name : 'societyExperiencesPositionMember'}
        ],


        jobType : [
            { id: 10, name : 'jobTypeFullTime'},
            { id: 20, name : 'jobTypePartTime'},
            { id: 30, name : 'jobTypeIntern'}
        ],

        jobCompanySize : [
            { id: 110, name : 'jobCompanySize20'},
            { id: 120, name : 'jobCompanySize50'},
            { id: 125, name : 'jobCompanySize80'},
            { id: 130, name : 'jobCompanySize100'},
            { id: 140, name : 'jobCompanySize200'},
            { id: 150, name : 'jobCompanySize500'},
            { id: 160, name : 'jobCompanySize1000'},
            { id: 170, name : 'jobCompanySize2000'},
            { id: 180, name : 'jobCompanySize5000'},
            { id: 190, name : 'jobCompanySize10000'}
        ],

        jobIndustry : [
            { id: 1100, name : 'jobIndustryComputer', children:
                [
                    {id:1105, name : 'jobIndustryComputer01'},
                    {id:1110, name : 'jobIndustryComputer02'},
                    {id:1115, name : 'jobIndustryComputer03'},
                    {id:1120, name : 'jobIndustryComputer04'},
                    {id:1125, name : 'jobIndustryComputer05'},
                    {id:1130, name : 'jobIndustryComputer06'},
                    {id:1135, name : 'jobIndustryComputer07'},
                    {id:1140, name : 'jobIndustryComputer08'},
                    {id:1145, name : 'jobIndustryComputer09'}
                ]
            },
            { id: 1200, name : 'jobIndustryFinance', children:
                [
                    {id:1205, name : 'jobIndustryFinance01'},
                    {id:1210, name : 'jobIndustryFinance02'},
                    {id:1215, name : 'jobIndustryFinance03'},
                    {id:1220, name : 'jobIndustryFinance04'},
                    {id:1225, name : 'jobIndustryFinance05'}
                ]
            },
            { id: 1300, name : 'jobIndustryManufacturing', children:
                [
                    {id:1305, name : 'jobIndustryManufacturing01'},
                    {id:1310, name : 'jobIndustryManufacturing02'},
                    {id:1315, name : 'jobIndustryManufacturing03'},
                    {id:1320, name : 'jobIndustryManufacturing04'},
                    {id:1325, name : 'jobIndustryManufacturing05'},
                    {id:1330, name : 'jobIndustryManufacturing06'},
                    {id:1335, name : 'jobIndustryManufacturing07'},
                    {id:1340, name : 'jobIndustryManufacturing08'},
                    {id:1345, name : 'jobIndustryManufacturing09'}
                ]
            },
            { id: 1400, name : 'jobIndustryBiotechnology', children:
                [
                    {id:1405, name : 'jobIndustryBiotechnology01'},
                    {id:1410, name : 'jobIndustryBiotechnology02'},
                    {id:1415, name : 'jobIndustryBiotechnology03'}
                ]
            },
            { id: 1500, name : 'jobIndustryAdvertising', children:
                [
                    {id:1505, name : 'jobIndustryAdvertising01'},
                    {id:1510, name : 'jobIndustryAdvertising02'},
                    {id:1515, name : 'jobIndustryAdvertising03'},
                    {id:1520, name : 'jobIndustryAdvertising04'},
                    {id:1525, name : 'jobIndustryAdvertising05'}
                ]
            },
            { id: 1600, name : 'jobIndustryConstruction', children:
                [
                    {id:1605, name : 'jobIndustryConstruction01'},
                    {id:1610, name : 'jobIndustryConstruction02'},
                    {id:1615, name : 'jobIndustryConstruction03'},
                    {id:1620, name : 'jobIndustryConstruction04'}
                ]
            },
            { id: 1700, name : 'jobIndustryEducation', children:
                [
                    {id:1705, name : 'jobIndustryEducation01'},
                    {id:1710, name : 'jobIndustryEducation02'},
                    {id:1715, name : 'jobIndustryEducation03'},
                    {id:1720, name : 'jobIndustryEducation04'},
                    {id:1725, name : 'jobIndustryEducation05'},
                    {id:1730, name : 'jobIndustryEducation06'},
                    {id:1735, name : 'jobIndustryEducation07'},
                    {id:1740, name : 'jobIndustryEducation08'}
                ]
            },
            { id: 1800, name : 'jobIndustryService', children:
                [
                    {id:1805, name : 'jobIndustryCustomerService01'},
                    {id:1810, name : 'jobIndustryCustomerService02'},
                    {id:1815, name : 'jobIndustryCustomerService03'},
                    {id:1820, name : 'jobIndustryCustomerService04'},
                    {id:1825, name : 'jobIndustryCustomerService05'}
                ]
            },
            { id: 1900, name : 'jobIndustryTransport', children:
                [
                    {id:1905, name : 'jobIndustryTransportation01'},
                    {id:1910, name : 'jobIndustryTransportation02'}
                ]
            },
            { id: 2000, name : 'jobIndustryEnergy', children:
                [
                    {id:2005, name : 'jobIndustryEnergy01'},
                    {id:2010, name : 'jobIndustryEnergy02'},
                    {id:2015, name : 'jobIndustryEnergy03'},
                    {id:2020, name : 'jobIndustryEnergy04'},
                    {id:2025, name : 'jobIndustryEnergy05'}
                ]
            },
            { id: 2100, name : 'jobIndustryOthers', children:
                [
                    {id:2105, name : 'jobIndustryOthers01'},
                    {id:2110, name : 'jobIndustryOthers02'},
                    {id:2115, name : 'jobIndustryOthers03'},
                    {id:2120, name : 'jobIndustryOthers04'},
                    {id:2125, name : 'jobIndustryOthers05'},
                    {id:2130, name : 'jobIndustryOthers06'}
                ]
            }
        ]

    }
    );



}());