<?php
date_default_timezone_set("Asia/Bangkok");
require_once('include/connection.php');
require_once('include/define.php');

$tb = "view_order";
$title_page = "";
$tbl_policy = "view_order";
$module = "calendar";


$datenow = date("m/d/Y");
$DayNow = explode("/", $datenow);
$GLOBALS["DayNow"] = mktime(0,0,0,$DayNow[0],$DayNow[1],$DayNow[2]); //mktime(hour, minute, second, month, day, year)


?>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />

    <!-- Bootstrap Core CSS -->
    <!-- <link href="calendar/css/bootstrap.min.css" rel="stylesheet"> -->
	
	<!-- FullCalendar -->
    <link href='calendar/css/fullcalendar.css' rel='stylesheet' />

<!--------  Bootstrp-select  ---------->
<link rel="stylesheet" href="js/bootstrap-select.css" />
 <!--------  Bootstrp-select  ---------->


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


</head>

<body>


<?PHP include_once("pages/M_filter_iw37.php"); ?>

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
			/***
			 customButtons: {
    			myCustomButton: {
      				text: 'custom!',
      				click: function() {		
						alert('t=');       			
      				}
    			}
  			}, 
			 
			fixedWeekCount: false,
            contentHeight: 650,
            views: {
                timelineCustom: {
			 	   type: 'timeline',
                        buttonText: 'Year',
                        dateIncrement: { years: 1 },
                        slotDuration: { months: 1 },
                        visibleRange: function (currentDate) {
                            return {
                                start: currentDate.clone().startOf('year'),
                                end: currentDate.clone().endOf("year")
							};							
                        }
                    }
				},
			****/		
			header: {
				left: 'prev,next today ',
				center: 'title',
				right: 'month,basicWeek,basicDay',
			},
			
			/*defaultDate: '2020-01-12',*/
            
            <?PHP  
            if(!empty($_POST["startD"]) && $_POST["startD"] <> "" ){
                $deDate = explode(".", $_POST["startD"] );
                $defaultDate =  $deDate[2]."-".$deDate[1]."-".$deDate[1];   
            }else {
                $defaultDate = date("Y-m-d");
            }
            ?>

			defaultDate: '<?PHP  echo $defaultDate; ?>',
			editable: true,
			eventLimit: true, // allow "more" link when too many events
			selectable: true,
			selectHelper: true,
			
			select: function(start, end ) {
				start = start.format('DD.MM.YYYY');
				end = end.format('DD.MM.YYYY');
				//alert('selected ' + start + ' to ' + end);
				//Send Ajax On Select Table
				$.ajax({
					url: 'modalPages/ModalMHshow.php',
			 		type: "POST",
			 		data: {Event:""+ start, End:""+ end },
			 			success: function(rep) {
						$("#Modal_MHshow").html(rep);	
						$("#ModalMHshow").modal('show'); //Open Modal										
					}
				});		
				//Send Ajax On Select Table	
			},
			
			eventRender: function(event, element) {				
				element.bind('click', function() {				
					var Events = [];
					Events[0] = event.id;
                    Events[1] = event.start.format('DD.MM.YYYY');
					
					//alert('selected ' + Events[0] );
					//Send Ajax On Select Table
					$.ajax({
						url: 'modalPages/ModalOrderDetail.php',
			 			type: "POST",
			 			data: {Event:Events },
			 				success: function(rep) {
							$("#Modal_OrderDetail").html(rep);	
							$("#ModalOrderDetail").modal('show'); //Open Modal										
						}
					});		
					//Send Ajax On Select Table	
				});				
			},
			eventDrop: function(event, delta, revertFunc) { // Move Plant **************
				<?PHP 
					//Loop หารหัส reson
					$sqlres = "SELECT * FROM  tbreason   ";
					$quRes = mysqli_query($link, $sqlres) or die ("Error Query [".$sqlres."]");
					$reson = "";
					while($rsRes = mysqli_fetch_array($quRes)){
						$reson .= $rsRes["reasoncode"] ."=". $rsRes["reasonname"]."\\r\\n";
					}
					//Loop หารหัส reson
					?>
					var Events = [];
					start = event.start.format('DD.MM.YYYY');	
					var person = prompt("Move To "+ start +"  \r\n<?PHP echo $reson;?> Please enter Reason:", "");		
					if (person == null || person == "") {
						Events[0] = '';
						Events[1] = '';
						Events[2] = '';
					}else{
						Events[0] = event.id;
						Events[1] = start;
						Events[2] = person;
					}					
					
					//alert('selected ' + Events[0] + Events[1] );
					//Send Ajax On Select Table					
					$.ajax({
						url: 'modalPages/MovePlant.php',
			 			type: "POST",
			 			data: {Event:Events },
			 				success: function(rep) {							
								alert(rep);				
						}
					});						
					//Send Ajax On Select Table	

			}, // Move Plant **************

			/****** ปิดยืดปฏิทิน **************
			eventResize: function(event,dayDelta,minuteDelta,revertFunc) { // si changement de longueur

				edit(event);

			},
			********   ปิดยืดปฏิทิน  ******************/
			eventMouseover: function( event, jsEvent, view ){ // ฟังก์ชั่นแสดงกล่องข้อความ Tooltip  
            callTooltip("#infotooltip",jsEvent,event.description);   
        },
        eventMouseout: function( event, jsEvent, view ){
            $("#infotooltip").hide();  
        } , // ฟังก์ชั่นแสดงกล่องข้อความ Tooltip  


	
				
			events: [
				
			<?php      
			 while( $event = mysqli_fetch_array($query)){
				
				if(!empty(trim($event["bscstart"]))){ // เช็คว่ามี Plan Date หรือไม่

				
				//หาวันที่มาแสดง
				if(!empty(trim($event["cday"]))  ) { //เช็คว่าย้ายแผนไปหรือยัง
					$start = date("Y-m-d", $event["cday"]);
					$end = date("Y-m-d",  $event["cday"]);					
				} else  if(!empty(trim($event["actfinish"]))){ // เช็คว่ามีวันที่ปิดงานหรือยัง
                    $start = date("Y-m-d", $event["actfinish"]);
					$end = date("Y-m-d",  $event["actfinish"]);	
                } else {  // ถ้ามีทั้งสองอย่างให้ใช้วันที่ plan จาก sap
					$start = date("Y-m-d", $event["bscstart"]);
					$end = date("Y-m-d",  $event["bscstart"]);					
				}//เช็คว่าย้ายแผนไปหรือยัง

				//เช็คย้ายข้ามเดือน
				if(!empty(trim($event["cday"]))  ){
					$MoveMc1 = date("m", $event["cday"]);
					$MoveMc2 = date("m", $event["bscstart"]);
				}else{
					$MoveMc1 = date("m", $event["bscstart"]);
					$MoveMc2 = date("m", $event["bscstart"]);
				}				
				//หาวันที่มาแสดง
		
				
				//หาจำนวนวันที่ เกินกำหนดวันที่ต้องทำ เทียบกับวันที่ปัจจุบัน
				$DateNum =ceil(($GLOBALS["DayNow"]-$event["bscstart"])/86400); // 

				//แสดงค่าสี ตามสถานะ
				$sqlsy = "SELECT * FROM tbwkstatus where syst='$event[syst]'	";  
				$qrsy = mysqli_query($link, $sqlsy) or die ("Error Query [".$sqlsy."]");
				while($wkstext = mysqli_fetch_array($qrsy)){
				
						if(!empty($event["cday"]) && $MoveMc1 <> $MoveMc2  && ( trim($wkstext["syst"]) =='REL'  ||  trim($wkstext["syst"]) =='CRTD' )  ){ //ย้ายข้ามเดือน
							$color =  $GLOBALS["ColorMove"];
						}else{
							$color = $wkstext["wkstcolor"] ;
						} //end if($DateNum > $GLOBALS["DayCondition"] && trim($event["syst"]) =='REL'  )
						
				} //end foreach($wkstatus as $wkstext)
		
				//แสดงค่าสี ตามสถานะ


				/****
				if($start[1] == '00:00:00'){
					$start = $start[0];
				}else{
					$start = $event['start'];
				}
				if($end[1] == '00:00:00'){
					$end = $end[0];
				}else{
					$end = $event['end'];
				}
				 */
				if( !empty(trim($event['actfinish'])) ){
					$endday  = date("d.m.Y", $event['actfinish']);
				}else {
					$endday = "-";
				}
			?>
				{
					id: '<?php echo $event['idiw37']; ?>',
					title: '<?php echo $event['wkorder'].' / ' . $event['wktype']  ; ?>', 
					start: '<?php echo $start; ?>',
					end: '<?php echo $end; ?>',
					color: '<?php echo $color; ?>', 
					description: '<?php echo $event['operationshorttext']; ?>',		 //Tooltip MouseOver						
				},
			<?php
				} // เช็คว่ามี Plan Date หรือไม่
			 } //endforeach; ?>	
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


<script>
function ShowEquipment(id){
    //alert(id);
    var Events = [];
    Events[0] = id;
					
		//alert('selected ' + Events[0] );
		//Send Ajax On Select Table
		$.ajax({
		url: 'pages/select_equipment.php',
		type: "POST",
		data: {Event:Events },
			success: function(rep) {
			$("#ShowEquipment").html(rep);										
		}
	});		
	//Send Ajax On Select Table	
}
</script>

<!---------  ปฏิทิน ------------->
<script>
        $(function() {
            $("#startD").datepicker({
                changeMonth: true,
                changeYear: true,  
				showButtonPanel: true,			
                dateFormat: 'dd.mm.yy'
            });
        });
</script>

<script>
        $(function() {
            $("#endD").datepicker({
                changeMonth: true,
                changeYear: true,  
				showButtonPanel: true,
                dateFormat: 'dd.mm.yy'
            });
        });
</script>
<!---------  ปฏิทิน ------------->


        <!---------ปฏิทิน--------->
        <script src="./js/jquery-ui.js"></script>
        <link rel="stylesheet" href="js/jquery-ui.css">

    <!--------  Bootstrp-select  ---------->

<script src="js/bootstrap.bundle.min.js"></script>
<script src="js/bootstrap-select.min.js"></script>

 <!--------  Bootstrp-select  ---------->