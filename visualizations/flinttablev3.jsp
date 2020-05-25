<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1">
<title>DEQ14</title>
<style type="text/css">
	body { font-family: 'Helvetica Neue', Helvetica; font-weight: 300; padding: 20px;} */
	th { text-align: left; } */
	th, td { padding: 0 1em 0.5ex 0;} */
	th.center, td.center { text-align: center; } */
     th.num, td.num { text-align: right; } */
</style>
<style>
	* { 
	  margin: 0; 
	  padding: 0; 
     }
     body { 
	   font: 14px/1.4 Georgia, Serif; 
     }
    #page-wrap {
	  margin: 50px;
    }
    p {
	 margin: 20px 0; 
    }

	/* 
	Generic Styling, for Desktops/Laptops 
	*/
	table { 
		width: 100%; 
		border-collapse: collapse; 
	}
	/* Zebra striping */
	tr:nth-of-type(odd) { 
		background: #eee; 
	}
	th { 
		background: #333; 
		color: white; 
		font-weight: bold; 
		cursor: s-resize;
		background-repeat: no-repeat;
        background-position: 3% center;
	}
	td, th { 
		padding: 6px; 
		border: 1px solid #ccc; 
		text-align: left; 
	}
	
	th.des:after {
      content: "\21E9";
    }
    
    th.aes:after {
      content: "\21E7";
    }
	
	/* 
	Max width before this PARTICULAR table gets nasty
	This query will take effect for any screen smaller than 760px
	and also iPads specifically.
	*/
	@media 
	only screen and (max-width: 760px),
	(min-device-width: 768px) and (max-device-width: 1024px)  {
	
		/* Force table to not be like tables anymore */
		table, thead, tbody, th, td, tr { 
			display: block; 
		}
		
		/* Hide table headers (but not display: none;, for accessibility) */
		thead tr { 
			position: absolute;
			top: -9999px;
			left: -9999px;
		}
		
		tr { border: 1px solid #ccc; }
		
		td { 
			/* Behave  like a "row" */
			border: none;
			border-bottom: 1px solid #eee; 
			position: relative;
			padding-left: 50%; 
		}
		
		td:before { 
			/* Now like a table header */
			position: absolute;
			/* Top/left values mimic padding */
			top: 6px;
			left: 6px;
			width: 45%; 
			padding-right: 10px; 
			white-space: nowrap;
		}
		
		/*
		Label the data
		*/
		td:before {
		  content: attr(data-th) ": ";
          font-weight: bold;
          width: 6.5em;
          display: inline-block;
		}
	}
	
	/* Smartphones (portrait and landscape) ----------- */
	@media only screen
	and (min-device-width : 320px)
	and (max-device-width : 480px) {
		body { 
			padding: 0; 
			margin: 0; 
			width: 320px; }
		}
	
	/* iPads (portrait and landscape) ----------- */
	@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
		body { 
			width: 495px; 
		}
	}
	
	</style>
</head>
<body>

<script src="https://d3js.org/d3.v3.js"></script>

 <div id="table_wrap" style="width=200%; margin-right:5px;">
        <h3>DEQ14</h3>
        <p>Click table headers to sort by ascending/descending order</p>
        <table></table>
    </div>
<script>	

var filling = [	{
    "filename": "deq14_b1000_3221_3222_1.txt",
    "original_timestamps": [
      "Thursday  December 10  2015 3:08 PM",
      "Thursday  December 10  2015 3:01 PM",
      "Thursday  December 10  2015 1:57 PM"
    ],
    "unix_timestamps": [
      1449781680,
      1449781260,
      1449777420
    ],
    "senders": [
      "Lasher, Geralyn (DHHS)",
      "Wurfel, Brad (DEQ)",
      "Lasher, Geralyn (DHHS)"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)",
      "Lasher, Geralyn (DHHS) [lasherg@michigan.gov]",
      "Wurfel, Brad (DEQ); Sygo, Jim (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1000_3221_3222_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1003_3224_3224_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1004_3225_3225_1.txt",
    "original_timestamps": [
      "Monday  December 14  2015 11:12 PM"
    ],
    "unix_timestamps": [
      1450156320
    ],
    "senders": [
      "Holton, Jennifer (MDARD)"
    ],
    "receivers": [
      "Waurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1005_3226_3226_1.txt",
    "original_timestamps": [
      "Tuesday  December 15  2015 10:26 AM",
      "Tuesday  December 15  2015 10:08 AM"
    ],
    "unix_timestamps": [
      1450196760,
      1450195680
    ],
    "senders": [
      "Marc Edwards [edwardsm@vt.edu]",
      "Marc Edwards [mailto:edwardsm@vi.edu]"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)",
      "Wurfel, Brad (DEQ) (WurfelB@michigan.gov)"
    ]
  },
  {
    "filename": "deq14_b1006_3227_3228_1.txt",
    "original_timestamps": [
      "Tuesday  December 15  2015 10:32 AM",
      "Tuesday  December 15  2015 9:50 AM",
      "Tuesday  December 15  2015 9:40 AM",
      "Dec 14  2015 10:32 PM"
    ],
    "unix_timestamps": [
      1450197120,
      1450194600,
      1450194000,
      1450153920
    ],
    "senders": [
      "Workman, Wayne (TREASURY)",
      "Byrne, Randall (Treasury)",
      "Natasha Henderson [mailto:nhenderson@®citvofflint.com]",
      "\"Sean Kammer\" [skammer@cityofflint.com]"
    ],
    "receivers": [
      "Khouri, Nick (TREASURY);Saxton, Thomas (Treasury);Muchmore, Dennis (GOV);Hollins,",
      "Workman, Wayne (TREASURY) [WorkmanW@michigan.gov]; Schafer, Suzanne K. (Treasury)",
      "Byrne, Randall (Treasury) [ByrneR1@michigan.gov]"
    ]
  },
  {
    "filename": "deq14_b1006_3227_3228_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": [
      "To:"
    ]
  },
  {
    "filename": "deq14_b1007_3229_3229_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1008_3230_3230_1.txt",
    "original_timestamps": [
      "Tuesday  December 15  2015 11:28 AM"
    ],
    "unix_timestamps": [
      1450200480
    ],
    "senders": [
      "Murray, David (GOV)"
    ],
    "receivers": [
      "Eisner, Jennifer (DHHS);Wurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1009_3231_3233_1.txt",
    "original_timestamps": [
      "Tuesday  December 15  2015 12:12 PM",
      "Tuesday  December 15  2015 10:32 AM",
      "Tuesday  December 15  2015 9:50 AM",
      "Tuesday  December 15  2015 9:40 AM"
    ],
    "unix_timestamps": [
      1450203120,
      1450197120,
      1450194600,
      1450194000
    ],
    "senders": [
      "Muchmore, Dennis (GOV)",
      "Workman, Wayne (TREASURY)",
      "Byrne, Randall (Treasury)",
      "Natasha Henderson [mazilto:nhenderson®cityofflint.com]"
    ],
    "receivers": [
      "Workman, Wayne (TREASURY);Khouri, Nick (TREASURY);Saxton, Thomas",
      "Khouri, Nick (TREASURY) [KhouriN@michigan.gov]; Saxton, Thomas (Treasury) [SaxtonT@michigan.gov];",
      "Workman, Wayne (TREASURY) [WorkmanW@michigan.gov]; Schafer, Suzanne K. (Treasury)",
      "Byrne, Randall (Treasury) [ByrneR1@michigan.gov]"
    ]
  },
  {
    "filename": "deq14_b1009_3231_3233_2.txt",
    "original_timestamps": [
      "Dec 14  2015 10:32 PM"
    ],
    "unix_timestamps": [
      1450153920
    ],
    "senders": [
      "\"Sean Kammer\" [skammer@cityofflint.com]"
    ],
    "receivers": [
      "To:"
    ]
  },
  {
    "filename": "deq14_b1009_3231_3233_3.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b100_247_247_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1010_3234_3234_1.txt",
    "original_timestamps": [
      "Wednesday  December 16  2015 5:55 PM"
    ],
    "unix_timestamps": [
      1450310100
    ],
    "senders": [
      "Sameen Amin [sameen.amin@aljazeera.net]"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1011_3235_3236_1.txt",
    "original_timestamps": [
      "Thursday  December 17  2015 11:46 AM",
      "Thursday  December 17  2015 11:15 AM"
    ],
    "unix_timestamps": [
      1450374360,
      1450372500
    ],
    "senders": [
      "Holton, Jennifer (MDARD)",
      "\"Stuever, Beth\" [stuever@anr.msu.edu]",
      "Ockert, Katherine"
    ],
    "receivers": [
      "Krisztian, George (DEQ);Averill, James (MDARD)",
      "\"Jennifer (Quimby) Holton\" [holtoni®michigan.gow]",
      "MSUEEVERYONE@LIST.MSU.EDU"
    ]
  },
  {
    "filename": "deq14_b1011_3235_3236_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1012_3237_3238_1.txt",
    "original_timestamps": [
      "Thursday  December 17  2015 8:45 PM",
      "December 19  12:30"
    ],
    "unix_timestamps": [
      1450406700,
      1608402600
    ],
    "senders": [
      "Holton, Jennifer (MDARD)",
      "\"Stuever, Beth\" [stugver@anr.msu.egdu]"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)",
      "\"Jennifer (Quimby) Holton\" [hoitoni®@michigan.gov]"
    ]
  },
  {
    "filename": "deq14_b1012_3237_3238_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_10.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_11.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_12.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_13.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_14.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_15.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_16.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_3.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_4.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_5.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_6.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_7.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_8.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1013_3239_3254_9.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1014_3255_3255_1.txt",
    "original_timestamps": [
      "Sunday  December 20  2015 2:51 PM"
    ],
    "unix_timestamps": [
      1450644660
    ],
    "senders": [
      "Bryan Hill [orificeflow@yahoo.com]"
    ],
    "receivers": [
      "Waurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1015_3256_3257_1.txt",
    "original_timestamps": [
      "Tuesday  December 22  2015 1:00 PM",
      "Monday  December 21  2015 3:44 PM"
    ],
    "unix_timestamps": [
      1450810800,
      1450734240
    ],
    "senders": [
      "Egan, Paul [mailto:pegan@freepress.com]"
    ],
    "receivers": [
      "Egan, Paul",
      "Wurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1015_3256_3257_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1018_3259_3259_1.txt",
    "original_timestamps": [
      "Wednesday  December 23  2015 1:43 PM"
    ],
    "unix_timestamps": [
      1450899780
    ],
    "senders": [
      "Minicuci, Angela (DHHS)"
    ],
    "receivers": [
      "Murray, David (GOV);Wurfel, Brad (DEQ);Brown, Jessica (GOV);Kennedy, Jordan"
    ]
  },
  {
    "filename": "deq14_b1019_3260_3261_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1019_3260_3261_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b101_248_253_1.txt",
    "original_timestamps": [
      "Monday  September 28  2015 10:20 PM",
      "Monday  September 28  2015 5:57 PM",
      "on March 25  2013 at 10:45 PM",
      "updated March 26  2013 at 1:28 AM"
    ],
    "unix_timestamps": [
      1443496800,
      1443481020,
      1364269500
    ],
    "senders": [
      "Wurfel, Brad (DEQ)",
      "Saxton, Thomas (Treasury)"
    ],
    "receivers": [
      "Wurfel, Sara (GOV)",
      "Muchmore, Dennis (GOV)"
    ]
  },
  {
    "filename": "deq14_b101_248_253_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b101_248_253_3.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b101_248_253_4.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b101_248_253_5.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b101_248_253_6.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1020_3262_3264_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1020_3262_3264_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1020_3262_3264_3.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_10.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_11.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_12.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_3.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_4.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_5.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_6.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_7.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_8.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1021_3265_3276_9.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1022_3277_3277_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1023_3278_3279_1.txt",
    "original_timestamps": [
      "Monday  December 28  2015 2:16 PM",
      "Monday  December 28  2015 1:01 PM"
    ],
    "unix_timestamps": [
      1451333760,
      1451329260
    ],
    "senders": [
      "Danielle Emerson [demerson@gongwer.com]",
      "Angela Wittrock [mailto: AWittro BN"
    ],
    "receivers": [
      "Waurfel, Brad (DEQ)",
      "Angela Wittrock"
    ]
  },
  {
    "filename": "deq14_b1023_3278_3279_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1024_3280_3282_1.txt",
    "original_timestamps": [
      "Monday  December 28  2015 2:17 PM"
    ],
    "unix_timestamps": [
      1451333820
    ],
    "senders": [
      "Lindsey Smith [Imsmi@umich.edu]",
      "Angela Wittrock [AWittrock{@senate michigan. gov]"
    ],
    "receivers": [
      "Waurfel, Brad (DEQ)",
      "Angela Wittrock [AWittrock@senate michigan.gov]"
    ]
  },
  {
    "filename": "deq14_b1024_3280_3282_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1024_3280_3282_3.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1025_3283_3285_1.txt",
    "original_timestamps": [
      "Monday  December 28  2015 2:46 PM",
      "Monday  December 28  2015 2:46 PM",
      "Monday  December 28  2015 1:01 PM"
    ],
    "unix_timestamps": [
      1451335560,
      1451335560,
      1451329260
    ],
    "senders": [
      "Macaluso, Nora [nmacaluso@bna.com]",
      "Wurfel, Brad (DEQ) [mzilto:WurfelB@michigan.gov]",
      "Angela Wittrock [mailto:AWitirock@senate.michigan.gov]"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)",
      "Macaluso, Nora [nmacaluso@bna.com]",
      "Angela Wittrock [AWitirock@®sanate.michigan.gov]"
    ]
  },
  {
    "filename": "deq14_b1025_3283_3285_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1025_3283_3285_3.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1026_3286_3286_1.txt",
    "original_timestamps": [
      "Monday  December 28  2015 3:35 PM",
      "Monday  December 28  2015 2:30 PM"
    ],
    "unix_timestamps": [
      1451338500,
      1451334600
    ],
    "senders": [
      "Danielle Emerson [mailto:demerson@®gongwer.com]"
    ],
    "receivers": [
      "Murray, David (GOV)",
      "Wurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1027_3287_3288_1.txt",
    "original_timestamps": [
      "Monday  December 28  2015 3:53 PM",
      "Monday  December 28  2015 3:44 PM",
      "Monday  December 28  2015 2:30 PM"
    ],
    "unix_timestamps": [
      1451339580,
      1451339040,
      1451334600
    ],
    "senders": [
      "Danielle Emerson [demerson@gongwer.com]",
      "Wurfel, Brad (DEQ) [maiito: WurfalB@michi",
      "Danielle Emerson [mziltg:demerson@gongwer.com"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)",
      "Danielle Emerson (demerson@gonawer.com)",
      "Wurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1027_3287_3288_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1028_3289_3290_1.txt",
    "original_timestamps": [
      "Monday  December 28  2015 6:17 PM"
    ],
    "unix_timestamps": [
      1451348220
    ],
    "senders": [
      "Holton, Jennifer (MDARD)"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1028_3289_3290_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1029_3291_3292_1.txt",
    "original_timestamps": [
      "Monday  December 28  2015 6:19 PM"
    ],
    "unix_timestamps": [
      1451348340
    ],
    "senders": [
      "Holton, Jennifer (MDARD)"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1029_3291_3292_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b102_254_255_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b102_254_255_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1030_3293_3294_1.txt",
    "original_timestamps": [
      "Monday  December 28  2015 6:21 PM"
    ],
    "unix_timestamps": [
      1451348460
    ],
    "senders": [
      "Holton, Jennifer (MDARD)"
    ],
    "receivers": [
      "Waurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1030_3293_3294_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1031_3295_3295_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1032_3296_3296_1.txt",
    "original_timestamps": [
      "Tuesday  December 29  2015 7:49 AM"
    ],
    "unix_timestamps": [
      1451396940
    ],
    "senders": [
      "Gary Wilson [garygIx5@gmail.com]"
    ],
    "receivers": [
      "Waurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1033_3297_3298_1.txt",
    "original_timestamps": [
      "Tuesday  December 29  2015 2:45 PM"
    ],
    "unix_timestamps": [
      1451421900
    ],
    "senders": [
      "GOV Newsroom [govnewsroom@govsubscriptions.michigan.gov]"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1033_3297_3298_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b103_256_256_1.txt",
    "original_timestamps": [
      "Monday  November 02  2015 7:32 PM"
    ],
    "unix_timestamps": [
      1446514320
    ],
    "senders": [
      "Wurfel, Brad (DEQ)",
      "\"Krisztian, George (DEQ)\" [krisztiang@michigan.gov]"
    ],
    "receivers": [
      "Wurfel, Sara (GOV)",
      "\"Wyant, Dan (DEQ)\" [WvantD@michigan.gov], \"Wurfel, Brad (DEQ)\" [WurfelB@michigan.gov]"
    ]
  },
  {
    "filename": "deq14_b104_257_259_1.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b104_257_259_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b104_257_259_3.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b105_260_260_1.txt",
    "original_timestamps": [
      "Wednesday  October 07  2015 5:05 PM"
    ],
    "unix_timestamps": [
      1444255500
    ],
    "senders": [
      "Wurfel, Brad (DEQ)",
      "\"Krisztian, George (DEQ)\" [krisztiang@michigan.gov]"
    ],
    "receivers": [
      "Wurfel, Sara (GOV); Lasher, Geralyn (DHHS)",
      "\"Wurfel, Brad (DEQ)\" [WurfelB@michigan.gov], \"Wyant, Dan (DEQ)\" [WvantD@michigan.gov],"
    ]
  },
  {
    "filename": "deq14_b1062_3302_3303_1.txt",
    "original_timestamps": [
      "Monday  November 16  2015 2:18 PM",
      "Monday  November 16  2015 2:14 PM",
      "Monday  November 16  2015 2:05 PM"
    ],
    "unix_timestamps": [
      1447705080,
      1447704840,
      1447704300
    ],
    "senders": [
      "Wurfel, Sara (GOV)",
      "Wurfel, Sara (GOV)",
      "Ronald Fonger [mailto:RECGNGERI @ miive.com"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ);Stanton, Terry A. (Treasury);Sampson, Jeremy (TREASURY);Lasher,",
      "'Ronald Fonger' [RFONGER1®@miive.com]",
      "Wurfel, Sara (GOV) [Wurfels@michigan.gov]"
    ]
  },
  {
    "filename": "deq14_b1062_3302_3303_2.txt",
    "original_timestamps": [],
    "unix_timestamps": [],
    "senders": [],
    "receivers": []
  },
  {
    "filename": "deq14_b1063_3304_3304_1.txt",
    "original_timestamps": [
      "Tuesday  November 17  2015 4:51 PM",
      "Tuesday  November 17  2015 4:43 PM"
    ],
    "unix_timestamps": [
      1447800660,
      1447800180
    ],
    "senders": [
      "Wurfel, Sara (GOV)",
      "Wurfel, Brad (DEQ)",
      "Jacob Kanclerz [jacob@mirsnews.com]"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ);Murray, David (GOV)",
      "Murray, David (GOV) [MurrayD1@michigan.gov]; Wurfel, Sara (GOV) [Wurfels@michigan.gov]",
      "\"Wurfel, Brad (DEQ)\" [wurfelb@michigan gov]"
    ]
  },
  {
    "filename": "deq14_b1064_3305_3306_1.txt",
    "original_timestamps": [
      "Tuesday  November 17  2015 5:01 PM",
      "Tuesday  November 17  2015 12:55 PM",
      "Tuesday  November 17  2015 10:07 AM"
    ],
    "unix_timestamps": [
      1447801260,
      1447786500,
      1447776420
    ],
    "senders": [
      "Wurfel, Sara (GOV)",
      "Wurfel, Brad (DEQ)",
      "Wurfel, Sara (GOV)"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ);Murray, David (GOV)",
      "Wurfel, Sara (GOV) [Wurfgis@michigan.gov]; Murray, David (GOV) [iurrayDi@michigan.gov]",
      "Wyant, Dan (DEQ); Wurfel, Brad (DEQ)"
    ]
  },
  {
    "filename": "deq14_b1064_3305_3306_2.txt",
    "original_timestamps": [
      "Tuesday  November 17  2015 9:53 AM"
    ],
    "unix_timestamps": [
      1447775580
    ],
    "senders": [
      "Ronald Fonger [mailto:RFQNGERI@milve.com]"
    ],
    "receivers": [
      "Wurfel, Sara (GOV) [Wurfels@michigan.gov]"
    ]
  },
  {
    "filename": "deq14_b1065_3307_3309_1.txt",
    "original_timestamps": [
      "Thursday  September 03  2015 12:28 PM",
      "Wednesday  September 02  2015 3:28 PM"
    ],
    "unix_timestamps": [
      1441301280,
      1441225680
    ],
    "senders": [
      "Wurfel, Brad (DEQ)",
      "Wurfel, Brad (DEQ)"
    ],
    "receivers": [
      "Wurfel, Sara (GOV) (Wurfels@michigan.gov);Murray, David (GOV)",
      "'Ronald Fonger'"
    ]
  },
  {
    "filename": "deq14_b1065_3307_3309_2.txt",
    "original_timestamps": [
      "Wednesday  September 02  2015 11:40 AM",
      "Wednesday  September 02  2015 11:37 AM"
    ],
    "unix_timestamps": [
      1441212000,
      1441211820
    ],
    "senders": [
      "Ronald Fonger [maillo:RFONGER]1 @mlive.com]",
      "Wurfel, Brad (DEQ) [mailio: WurfelB@michigan.qaov]"
    ],
    "receivers": [
      "Wurfel, Brad (DEQ)",
      "Ronald Fonger"
    ]
  }
];

d3.json(filling, function (error,json) {

	  function tabulate(json, columns) {
		  var sortAscending = true
			var table = d3.select('body').append('table')

			var thead = table.append('thead')
			var	tbody = table.append('tbody')
			.on('dblclick', function(d) {
    console.log('open tab')
    window.open(
      'tabletwo.jsp'
    );
  });;

			// append the header row
			thead.append('tr')
			  .selectAll('th')
			  .data(columns).enter()
			  .append('th')
			    .text(function (column) { return column; })
			    .on('click', function (d) {
		                	   thead.attr('class', 'header');
		                	   
		                	   if (sortAscending) {
		                	     rows.sort(function(a,b) { return b[d] < a[d]; });
		                	     sortAscending = false;
		                	     this.className = 'aes';
		                	   } else {
		                		 rows.sort(function(a,b) { return b[d] > a[d]; });
		                		 sortAscending = true;
		                		 this.className = 'des';
		                	   } });

			// create a row for each object in the data
			var rows = tbody.selectAll('tr')
			  .data(json)
			  .enter()
			  .append('tr')
			 ;

			// create a cell in each row for each column
			var cells = rows.selectAll('td')
			  .data(function (row) {
			    return columns.map(function (column) {
			      return {column: column, value: row[column]};
			    });
			  })
			  .enter()
			  .append('td')
			    .text(function (d) { return d.value; })
			    ;
			

		  return table;
		}

		// render the table(s)
			tabulate(filling, ["filename","original_timestamps","unix_timestamps","senders","receivers"]); // 2 column table

		
		function colsUpdate() {
			  if (group === '') {
			  	d3.selectAll('table tbody tr').style('display','table-row');
			  } else {
			    d3.selectAll('table tbody tr')[0].forEach(function(el){
			    	d3.select(el).style('display', d3.select(el).data()[0].group == group ? 'table-row' : 'none');
			    });
			  }
			}
		
		
		d3.selectAll('.dropdown-submenu.group > a').on("click", function(d) {
			group = this.text;
		  colsUpdate()});		
	
//         .on('dblclick', function(d) {
//     console.log('open tab')
//     window.open(
//       'table2.jsp',
//       '_blank' // <- This is what makes it open in a new window.
//     )});

});
	
	


	
</script>
</body>
</html>