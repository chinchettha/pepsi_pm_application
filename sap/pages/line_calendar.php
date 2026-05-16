<?php
date_default_timezone_set("Asia/Bangkok");
require_once('include/connection.php');
require_once('include/define.php');

$datenow = date("m/d/Y");
$DayNow = explode("/", $datenow);
$GLOBALS["DayNow"] = mktime(0,0,0,$DayNow[0],$DayNow[1],$DayNow[2]); //mktime(hour, minute, second, month, day, year)

//search Data Table TBiw37n
$sql = "SELECT * FROM view_lineschdul  ";
$req = $bdd->prepare($sql);
$req->execute();
$events = $req->fetchAll();
?>

    <!-- Bootstrap Core CSS -->
    <!-- <link href="calendar/css/bootstrap.min.css" rel="stylesheet"> -->
	
	<!-- FullCalendar -->
	<link href='calendar/css/fullcalendar.css' rel='stylesheet' />

    <!-- Custom CSS -->
    <style>
    body {
       /* padding-top: 70px; */
        /* Required padding for .navbar-fixed-top. Remove if using .navbar-static-top. Change if height of navigation changes. */
    }
	#calendar {
		max-width: 100%;
	}
	.col-centered{
		float: none;
		margin: 0 auto;
	}
    </style>

<!-- // ฟังก์ชั่นแสดงกล่องข้อความ Tooltip    --->
<style type="text/css">   
/* css สำหรับกำหนดรูปแบบของกล่องข้อความ Tooltip */ 
.iTooltip{  
    position:absolute;  
    border:1px solid #FFCC66;  
    background-color:#FFFFCC;  
    color:#000000;  
    display:none;  
    padding:5px;  
/*  width:200px;*/ 
    font-size:12px;  
    z-index:90000;
}  
</style>
<!-- // ฟังก์ชั่นแสดงกล่องข้อความ Tooltip    --->


</head>

<body>

    <!-- Page Content -->
    <div class="container">

        <div class="row">
            <div class="col-lg-12 text-center">
                <h3> Product Line Scheduling.</h3>
                <!-- <p class="lead">Plan Scheduling and Close Work Order.</p> -->
                <div id="calendar" class="col-centered">
                </div>
            </div>
			
        </div>
        <!-- /.row -->
		<span class='iTooltip' id="infotooltip"></span>   <!-- // ฟังก์ชั่นแสดงกล่องข้อความ Tooltip    --->
		
		
		<!--******************* Show Modal  Ajax ************************-->
		<div id='Modal_MHshow'>	</div>
		<div id='Modal_OrderDetail'>	</div>  
		<!--******************* Show Modal  Ajax ************************-->
		
		
		
    <!-- /.container -->

    <!-- jQuery Version 1.11.1 -->
    <script src="calendar/js/jquery.js"></script>

    <!-- Bootstrap Core JavaScript -->
    <!-- <script src="calendar/js/bootstrap.min.js"></script> -->
	
	<!-- FullCalendar -->
	<script src='calendar/js/moment.min.js'></script>
	<script src='calendar/js/fullcalendar.min.js'></script>
	<script src='../calendar/js/upcalendar.js'></script>
	
	
	<script>

	$(document).ready(function() {
		
		$('#calendar').fullCalendar({	
	
			header: {
				left: 'prev,next today ',
				center: 'title',
				right: 'month,basicWeek,basicDay',
			},
			
			/*defaultDate: '2020-01-12',*/
			defaultDate: '<?PHP  echo date("Y-m-d"); ?>',
			editable: true,
			eventLimit: true, // allow "more" link when too many events
			selectable: true,
			selectHelper: true,
			

		// ฟังก์ชั่นแสดงกล่องข้อความ Tooltip  
		eventMouseover: function( event, jsEvent, view ){ 
            callTooltip("#infotooltip",jsEvent,event.description);   
        },
        eventMouseout: function( event, jsEvent, view ){
            $("#infotooltip").hide();  
        } , // ฟังก์ชั่นแสดงกล่องข้อความ Tooltip  
				
			events: [
				
			<?php foreach($events as $event): 
				
				if(!empty(trim($event["lineday"]))){ // เช็คว่ามี Plan Date หรือไม่

				
				//หาวันที่มาแสดง
				if(!empty(trim($event["lineday"]))  ) { //เช็คว่าย้ายแผนไปหรือยัง
					$start = date("Y-m-d", $event["lineday"]);
					$end = date("Y-m-d",  $event["lineday"]);

					$sTime = mktime(7,0,0,date("m", $event["lineday"]),date("d", $event["lineday"]),date("Y", $event["lineday"]) );
					$sTime = date("d.m.Y H:i", $sTime);
					$upt = 7+$event["uptime"];
					$eTime = mktime($upt,0,0,date("m", $event["lineday"]),date("d", $event["lineday"]),date("Y", $event["lineday"]) );
					$eTime = date("d.m.Y H:i",  $eTime );	
				} 
				//หาวันที่มาแสดง
		
				if(!empty(trim($event["uptime"]))){
					$color = "#408a63" ;
					$am = $sTime." น. <strong> TO </strong> ". $eTime ." น." ;
				} else{
					$color = "#bfbfbf";
					$am = "Close";
				}// end if(!empty(trim($event["uptime"]))){				
			
		
				//แสดงค่าสี ตามสถานะ

		
			?>
				{
					id: '<?php echo $event['idline']; ?>',
					title: '<?php echo $event['productline'].' / Work : ' . $event['uptime']  ; ?>', 
					start: '<?php echo $start; ?>',
					end: '<?php echo $end; ?>',
					color: '<?php echo $color; ?>', 
					description: '<?php echo $am; ?>',		 //Tooltip MouseOver						
				},
			<?php
				} // เช็คว่ามี Plan Date หรือไม่
			endforeach; ?>	
			]
		});
		
		function edit(event){
			start = event.start.format('YYYY-MM-DD HH:mm:ss');
			if(event.end){
				end = event.end.format('YYYY-MM-DD HH:mm:ss');
			}else{
				end = start;
			}
			
			id =  event.id;
			
			Event = [];
			Event[0] = id;
			Event[1] = start;
			Event[2] = end;
			
			$.ajax({
			 url: 'calendar/editEventDate.php',
			 type: "POST",
			 data: {Event:Event},
			 success: function(rep) {
					if(rep == 'OK'){
						alert('Saved');
					}else{
						alert('Could not be saved. try again.'); 
					}
				}
			});
		}

		var callTooltip = function (obj,jsEvent,strText){ // ฟังก์ชั่นแสดงกล่องข้อความ Tooltip  
        var locateX=jsEvent.pageX;     
        var locateY=jsEvent.pageY;   
        locateX+=30;  
        locateY-=40;  
        $(obj).show().css({  
            left:locateX,  
            top:locateY  
        }).html(strText);                 
		}  // ฟังก์ชั่นแสดงกล่องข้อความ Tooltip  
		
	});

</script>

