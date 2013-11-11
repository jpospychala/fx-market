/**
 * Sets rates from CSV file
 */
var csv = require('csv');
var Deferred = require('promised-io/promise').Deferred;
var rates_api = require('./rates_api.js');
var date = require('./date.js');

var csv_from_file = function(path) {
    var deferred = new Deferred();
    csv().from.path('gpw/'+path+'.csv').to.array(function(arr) {
        deferred.resolve({'path':path, 'data':arr});
    });
    return deferred.promise;
}

var csv_from_files = function(paths) {
    var deferred = new Deferred();
    result = {};
    count = paths.length;
    for (p in paths) {
        csv_from_file(paths[p]).then(function(data) {
            result[data.path] = data.data;
            count--;
            if (count == 0) {
                deferred.resolve(result);
            }
        })
    }
    
    return deferred.promise;
}

console.log('rates from csv');
if (process.argv.length < 6) {
    console.log('usage: node '+process.argv[1]+' <host> <port> <admin_key> <start_date>');
    return 1;
}

var rest_host = process.argv[2];
var rest_port = process.argv[3];
var admin_token = process.argv[4];
var start_date = process.argv[5];

get_by_date = function(date, where) {
    for (var k in where) {
        if (where[k][0] == date) {
            return where[k];
        }
    }
    
    return undefined;
}

names = 
    //["06N", "08N", "4FM", "AAL", "AAT", "ABC", "ABE", "ABM", "ABS", "ACE", "ACG", "ACP", "ACS", "ACT", "ADD", "ADS", "AGO", "AGT", "ALC", "ALM", "ALR", "ALT", "AMB", "AMC", "APL", "APN", "APT", "ARC", "ARM", "ARR", "ASB", "ASE", "ASG", "AST", "ATC", "ATD", "ATG", "ATL", 
    //    "ATM", "ATP", "ATR", "ATS", "ATT", "AWB", "AWG", "B3S", "BAK", "BAL", "BBD", "BCM", "BDL", "BDV", "BDX", "BDZ", "BFT", "BGZ", "BHW", "BIO", "BLI", "BMC", "BMP", "BNP", "BOS", "BOW", "BPH", "BPM", "BRE", "BRG", "BRK", "BRS", "BSC", "BST", "BTM", "BVD", "BZW", "CAM", 
    //    "CAR", "CCC", "CCE", "CCI", "CDR", "CEZ", "CFL", "CHS", "CIE", "CIG", "CLE", "CMP", "CMR", "CMX", "CNG", "CNT", "COG", "COL", "CPA", "CPD", "CPS", "CRM", "CTC", "CZT", "DBC", "DCR", "DEL", "DGA", "DOM", "DPL", "DRE", "DRP", "DSS", "DUD", "DUO", "EAT", "ECD", "ECH", 
    //    "EDI", "EEF", "EEX", "EFH", "EFK", "EHG", "EKA", "EKP", "ELB", "ELT", "ELZ", "EMC", "EMF", "EMP", "ENA", "ENE", "ENI", "ENP", "EPD", "ERB", "ERG", "ESS", "EST", "ETL", "EUC", "EUI", "EUR", "EXL", "FAM", "FCL", "FEE", "FEG", "FER", "FFI", "FMF", "FON", "FOT", "FRO", 
    //    "FSG", "FTE", "GCN", "GET", "GLC", "GLE", "GMM", "GNB", "GNT", "GPW", "GRI", "GRJ", "GRL", "GTC", "GTN", "HDR", "HEL", "HGN", "HRP",
    //    "HRS", "HTM", "HWE", "HYP", "IDA", "IDE", "IDM", "IFC", "IIA", "IMC", "IMP", "IMX", "INC", "IND", "INF", "ING", "INK", "INL", "INP", 
    //    "INV", "IPE", "IPF", "IPL", "IPO", "IPX", "IQP", "IRL", "ITB", "ITG", "ITK", "IZO", "IZS", "JHM", "JPR", "JSW", "JWC", "K2I", "KAN", "KBD", "KBM", "KCH", "KCI", "KDM", "KER", "KFL", "KGH", "KGN", "KMP", "KOM", "KPD", "KPL", "KPX", "KRC", "KRI", "KRK", "KRU", "KSG", 
    //    "KST", "KSW", "KTY", "KZS", "LBT", "LBW", "LCC", "LEN", "LPP", "LSI", "LST", "LTS", "LTX", "LWB", "MAB", "MAG", "MAK", "MBR", "MCI", "MCL", "MCR", "MDS", "MEG", "MEW", "MEX", "MIL", "MIP", "MIR", "MIT", "MKM", "MLG", "MLG", "MLK", "MNC", "MNI", "MOJ", "MOL", "MON", 
    //    "MRB", "MSO", "MSP", "MSW", "MSX", "MSZ", "MTL", "MVP", "MWT", "MZA", "NCT", "NDA", "NEM", "NET", "NEU", "NOK", "NTT", "NVA", "NVT", "NWR", "O2O", "OBL", "ODL", "OEG", "OIL", "OPF", "OPG", "OPM", "OPN", "ORB", "OTM", "OTS", "OVO", "PAT", "PBF", "PBG", "PBO", "PCE", 
    //    "PCG", "PCI", "PCX", "PEK", "PEL", "PEO", "PEP", "PEX", "PGD", "PGE", "PGM", "PGN", "PGO", "PGS", "PHN", "PJP", "PKN", "PKO", "PKP", "PLA", "PLT", "PLX", "PLZ", "PMA", "PMD", "PMG", "PMP", "PND", "POM", "POZ", "PPG", "PPS", "PQA", "PRC", "PRD", "PRE", "PRF", "PRI",] 
        ["PRM", "PRT", "PTI", "PUE", "PWM", "PXM", "PZU", "QMK", "QNT", "QRS", "RAF", "RBC", "RBW", "RDL", "RDN", "REG", "RES", "RFK", "RHD", "RLP", "RMK", "RNK", "ROB", "RON", "RPC", "RSE", "RWL", "SCO", "SEK", "SEL", "SEN", "SFG", "SFS", "SGN", "SGR", "SKA", "SKC", "SKL", 
        "SKO", "SKT", "SME", "SMT", "SNK", "SNS", "SNW", "SOL", "SON", "SPH", "STF", "STP", "STX", "SUW", "SWD", "SWG", "TAR", "TEL", "TER", "TFO", "TIM", "TLX", "TMR", "TOA", "TPE", "TPS", "TRI", "TRK", "TRN", "TSG", "TVL", "TVN", "U2K", "UCG", "ULM", "UNI", "URS", "VIN", 
        "VOT", "VOX", "VRT", "VST", "VTG", "WAS", "WAX", "WDM", "WDX", "WES", "WIK", "WIS", "WLB", "WLT", "WOJ", "WSE", "WST", "WWL", "WXF", "YWL", "ZAP", "ZEP", "ZKA", "ZMT", "ZRE", "ZST", "ZUE", "ZUK", "ZWC"];
wig20 = ['ACP', 'BHW', 'PEO', 'BRS', 'BRE', 'GTC', 'LTS', 'JSW', 'KER', 'KGH', 'LWB', 'PKN', 'PKO', 'PGE', 'PGN', 'PZU', 'SNS', 'TPE', 'TPS', 'EUR'];

csv_from_files(wig20).then(function(data) {
    var rates = new rates_api.Rates(rest_host, rest_port, admin_token);
    var curr_date = date.parse(start_date);
    
    update_rates = function() {
        var out = {};
        for (var prod in data) {
            var prod_data = data[prod];
            var prod_bydate = get_by_date(date.format(curr_date), prod_data);
            if (prod_bydate) {
                out[prod] = parseFloat(prod_bydate[1].replace(',', '.'));
            }
        }
        console.log(date.format(curr_date), out);
        rates.set_rates(out);
        curr_date = date.add(curr_date, 1);
    }

    //update_rates();
    setInterval(update_rates, 1000);
});

