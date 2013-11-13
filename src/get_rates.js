var fs = require('fs');
var http = require('http');
var Deferred = require('promised-io/promise').Deferred;
var date = require('./date.js');

var raw_get_rates = function(symbol, date_from, date_to) {
    var deferred = new Deferred();
    var res_fn = function(res) {
        res.setEncoding('utf8');
        var all_data = '';
        res.on('data', function(data) {
            all_data += data;
        });
        res.on('end', function() {
            deferred.resolve(all_data);
        });
    };
    
    var content = 'symbol='+symbol+'&od='+date_from+'&do='+date_to+'&period=0&format=csv';
    var req = http.request({
       'hostname': 'www.money.pl',
       'port': 80,
       'path': '/gielda/archiwum/spolki/',
       'method': 'POST',
       'headers':{'Content-Length': content.length,
           'Content-Type': 'application/x-www-form-urlencoded' }
    }, res_fn);
    
    
    req.write(content);
    req.end();
    
    return deferred.promise;
}

var get_rates = function(symbol, date_from, date_to) {
    var deferred = new Deferred();
    var all_data = '';
    
    var page_size = 49;
    var days =  date.diff(date_from, date_to);
    var page_count = Math.ceil(days / page_size);
    while (days > 0) {
        var sub = days > page_size ? page_size : days;
        days -= sub;
        var date_to = date.add(date_from, sub);
        var from_str = date.format(date_from);
        var to_str = date.format(date_to);
        raw_get_rates(symbol, from_str, to_str).then(function(data) {
            all_data += data;
            page_count--;
            if (page_count == 0) {
                deferred.resolve(all_data);
            }
        })
        if (days > 0) {
            days--;
            date_from = date.add(date_to, 1);
        }
    }
    
    return deferred.promise;
}

names = []; 
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
     // "PRM", "PRT", "PTI", "PUE", "PWM", "PXM", "PZU", "QMK", "QNT", "QRS", "RAF", "RBC", "RBW", "RDL", "RDN", "REG", "RES", "RFK", "RHD", "RLP", "RMK", "RNK", "ROB", "RON", "RPC", "RSE", "RWL", "SCO", "SEK", "SEL", "SEN", "SFG", "SFS", "SGN", "SGR", "SKA", "SKC", "SKL", 
     // "SKO", "SKT", "SME", "SMT", "SNK", "SNS", "SNW", "SOL", "SON", "SPH", "STF", "STP", "STX", "SUW", "SWD", "SWG", "TAR", "TEL", "TER", "TFO", "TIM", "TLX", "TMR", "TOA", "TPE", "TPS", "TRI", "TRK", "TRN", "TSG", "TVL", "TVN", "U2K", "UCG", "ULM", "UNI", "URS", "VIN", 
     //"VOT", "VOX", "VRT", "VST", "VTG", "WAS", "WAX", "WDM", "WDX", "WES", "WIK", "WIS", "WLB", "WLT", "WOJ", "WSE", "WST", "WWL", "WXF", "YWL", "ZAP", "ZEP", "ZKA", "ZMT", "ZRE", "ZST", "ZUE", "ZUK", "ZWC"];

preprocess = function(data) {
    var lines = data.split('\n');
    lines = lines.sort();
    var out = ['"data","otw","min","max","zamkniecie","zmiana","obroty mln"'];
    for (var l in lines) {
        var line = lines[l];
        if (line.indexOf('"') == 0) {
            out.push(line);
        }
    }
    return out.join('\n');
}

for (var n in names) {
    var rname = names[n];
    (function(rn) {
        get_rates(rn, new Date(2010, 0, 01), new Date()).then(function (data) {
            console.log(rn);
            var data = preprocess(data);
            var fd = fs.openSync('../resources/gpw/'+rn+'.csv', 'w');
            fs.writeSync(fd, data, 0, data.length);
            fs.closeSync(fd);
        });
    })(rname);
}
