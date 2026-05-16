<?php

// Connexion à la base de données
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
require_once('../include/define.php');

$tb = "view_order";

$startDay = $_POST['Event'];
$end = $_POST['End'];
//แปลงเป็น mktime
$start = explode(".", $startDay);
$Start = mktime(0,0,0,$start[1],$start[0],$start[2]);




$sqlMH = "SELECT * FROM  $tb where bscstart = '$Start' or cday= '$Start'  ";
$queryMH = mysqli_query($link, $sqlMH) or die ("Error Query [".$sqlMH."]");
$numMH = mysqli_num_rows($queryMH);
if($numMH>0){ 
?>
<div class="modal fade" id="ModalMHshow" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
		  

<div class="modal-dialog modal-lg" role="document">
			<div class="modal-content">
			<form class="form-horizontal" method="POST" action="calendar/addEvent.php">
			
			  <div class="modal-header">
			  <button type="buton" class="form-control aling-center alert alert-success" placeholder="operationst" id="operationst" name="operationst" style=" text-align: center;">Man Hours Date <?PHP echo $startDay;?> </button>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
			
			  </div>
			  <div class="modal-body">
				<?PHP
					//หาจำนวน Man Hour รวมทั้งหมด
					$ManHour = 0;
					$ManHourA = 0;
					while($rsMH = mysqli_fetch_array($queryMH)){
						//หาจำนวน ชม. ทำงานทั้งหมด
						if($rsMH["untime"]=="H"){ // แปลง H เป็นหน่วย MIN
							$wkMIN = $rsMH["work"] * 60;
							$wkMINa = $rsMH["actwork"] * 60;							
						}else {
							$wkMIN = $rsMH["work"];
							$wkMINa = $rsMH["actwork"];
						} //end if($rsMH["untime"]=="H")						
						$ManHour = $ManHour + $wkMIN; //รวม MH Work
						$ManHourA = $ManHourA + $wkMINa; //รวม MH Action
						$ManHourH =  $ManHour/60;  //แปลงเป็น ชม
						$ManHourAH =  $ManHourA/60; //แปลงเป็น ชม

					} //end  while($rsMH = mysqli_fetch_array($queryMH)){
					// close หาจำนวน Man Hour รวมทั้งหมด 	
					?>	
						<div class="alert alert-info aling-center " >						
  							<strong>Man Hour Plan </strong> <?PHP echo $ManHour;?> MIN ( <?PHP echo sprintf("%.2f",$ManHourH);?>  H)   / 
							<strong>Man Hour Action </strong> <?PHP echo $ManHourA;?> MIN   ( <?PHP echo sprintf("%.2f",$ManHourAH);?>  H)   
						</div>

                    <div class="alert alert-warning aling-center row ">
                        <strong> Work Order </strong> &nbsp; <?PHP echo $numMH; ?> 
                        <?PHP 
                            //หา ZB
                            $sqlZB = " SELECT * from tbwkzb order by wkzb ASC ";
                            $qrZB = mysqli_query($link, $sqlZB) or die ("Error Query [".$sqlZB."]");
                            $numZB = mysqli_num_rows($qrZB);
                            while($rowZB = mysqli_fetch_array($qrZB)){
                            ?> &nbsp;
                            / <strong> <?PHP echo  $rowZB["wkzb"]; ?>  </strong> &nbsp;
                            <?PHP   
                                $sqlZBc = " SELECT * from $tb where (bscstart = '$Start' or cday= '$Start' ) and wktype = '".$rowZB["wkzb"]."' ";
                                $qrZBc = mysqli_query($link, $sqlZBc) or die ("Error Query [".$sqlZBc."]");
                                $numZBc = mysqli_num_rows($qrZBc);
                                echo $numZBc . "  ";
                            } 
                            //หา ZB
                        ?> 

          
            <?PHP  //หาจำนงานที่ทำเสร็จแล้วทั้งหมด ***********************
                $sqlCP = "SELECT * FROM $tb where syst NOT IN ('CRTD', 'REL') and ( bscstart = '$Start' or cday= '$Start' )  ";
                $qrCP = mysqli_query($link, $sqlCP) or die ("Error Query [".$sqlCP."]");
                $numCP = mysqli_num_rows($qrCP);  
                $percent = ( $numCP /$numMH )*100;
                $pt = number_format( $percent , 0 );
            ?>
           <div class="col  " > /<strong>completion </strong> &nbsp; <?PHP  echo $numCP ;?> &nbsp; </div>            
            <div class="col alert-warning"> 
            <div class="progress">
                <div class="progress-bar"  role="progressbar" aria-valuenow="<?PHP  echo $pt;?>"  aria-valuemin="0" aria-valuemax="100" style="width:<?PHP  echo $pt;?>%"> <?PHP   echo  $pt ;?> % </div>
            </div>
            </div>
            

                    </div>
									
					<table class="table table-bordered table-hover" id="dataTableMH" width="100%" cellspacing="0" data-page-length='5'>
						<thead class="thead-dark">
							<tr>
								<th>Work Order/Type</th>
								<th>Status</th>
								<th>Plan</th>
								<th>Action</th>
								<th>Unit</th>
							</tr>
						</thead>
			
						<tbody>
						<?php		
						$queryST = mysqli_query($link, $sqlMH) or die ("Error Query [".$sqlMH."]");						
						while($rsT = mysqli_fetch_array($queryST)){
						?>
							<tr>
								<td> <span data-toggle="tooltip" title="<?php echo $rsT['operationshorttext'];?>" > <?php echo $rsT['wkorder'];?> / <?php echo $rsT['wktype'];?></td>
								<td class="aling-center" ><?php echo $rsT['syst'];?></td>
								<td class="aling-center"><?php echo $rsT['work'];?></td>
								<td class="aling-center"><?php echo $rsT['actwork'];?></td>
								<td class="aling-center" ><?php echo $rsT['untime'];?></td>
							</tr>
						<?php } //end while($rsT = mysqli_fetch_array($queryMH)) ?>
						</tbody>
					</table>				
					
						
			  </div>
			  <div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
			  </div>
			</form>
			</div>
		  </div>
</div>


<?PHP  } //end  if($numMH>0) ?>

<!---------- Data Table----------->
<script>
	$(document).ready(function() {
    $('#dataTableMH').DataTable({
		"lengthMenu": [ 5, 10,20,30,100 ]
	});
} );

</script>
<!---------- Data Table----------->