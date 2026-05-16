<div class="card card-info">
              <div class="card-header">
                <h3 class="card-title">รายการภาพประกอบ</h3>
              </div>
              <!-- /.card-header -->
              <!-- form start -->
			  <div class="table-responsive " style="text-align: center" >
			  <div class="row">
			  <?PHP  


				// หาค่า $idiw37
				$Events =  $_REQUEST["Event"]; //รับค่อ Ajax แบบ Post
				if(!empty(isset($Events[2]))){
					$idiw37 = $Events[2];
				}else if(!empty(isset($_REQUEST["idiw37"]))){
                    $idiw37 = $_REQUEST["idiw37"];
				}else {
                	$idiw37 = $rsTB1['idiw37'];
				}


				//หาค่า syst
				$SqlSyst = " SELECT * FROM  view_order where  idiw37= '$idiw37'  ";
				$qrSyst = mysqli_query($link, $SqlSyst) or die ("Error Query [".$SqlSyst."]");
				$totalSyst = mysqli_num_rows($qrSyst);

				if($totalSyst >0){
					$rsSyst = mysqli_fetch_array($qrSyst);
					$syst = $rsSyst["syst"];
				}
				//ปิด หาค่า syst
				
				// ปิดหาค่า $idiw37
				
				$strSQL_img = " SELECT * FROM tbconfirmimg where idiw37 ='".$idiw37."' order by cfname ";
				//echo $strSQL_img;
				$query_img = mysqli_query($link, $strSQL_img);
				//$result = mysqli_fetch_array($query_img);
				$numrow_img = mysqli_num_rows($query_img);

				if ($numrow_img>0){
					$i=0;
					while($result_img = mysqli_fetch_array($query_img)){
						$i++;

				?>
				<div class="col-sm-4" >
						<div data-toggle="modal" data-target="#Modal<?PHP echo $result_img["idcimg"]; ?>">
						<img src="imgComfirm/<?php echo $result_img['cfilename'];?>" class="img-thumbnail img-rounded" style="width:250px; height: 250px;" data-toggle="tooltip" 
				   data-placement="top" title="<?php echo $result_img['cimgcom'];?>" >	
						</div>
						<div >
						<?PHP 
						
					if(trim($syst) == "CRTD" || trim($syst) == "REL"  ){ //ปิดงานแล้ว ลบไม่ได้					
						if($result_img["wkctr"] == $_SESSION["wkctr"] ){ //ถ้าไม่ใช้คนอัพไฟล์ไม่สามารถลบได้
						?>
						<button type="button" class="btn btn-warning" onclick="if(confirm('Confirm Delete?')==true){ return DelImg('#ShowImg','<?PHP echo $result_img['idcimg']; ?>','Del','<?PHP echo $idiw37; ?>') };" ><i class="far fa-trash-alt"></i> Delete </button>
						<?PHP  	
						} // end if($result_img["wkctr"]){
					} // end if(trim($rsTB1["syst"]) == "CRTD" || trim($rsTB1["syst"]) == "REL"  ){ //ปิดงานแล้ว ลบไม่ได้
						?>
						
						</div>					
			
						
		
				</div>

<!-- Modal -->
<div class="modal fade" id="Modal<?PHP echo $result_img["idcimg"]; ?>" role="dialog">
    <div class="modal-dialog modal-lg">
    
      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header">
          
		  <h4 class="modal-title"> ว้นที่ Upload :  <?php echo date("d.m.Y" , $result_img['cfname']) ;?></h4>
		  <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <div class="modal-body">
          <p>
		  	<img src="imgComfirm/<?php echo $result_img['cfilename'];?>" class="img-thumbnail img-rounded" style="width:800px; height: auto;">
		  </p>
		  <p>
		  <?php echo "คำอธิบาย : ". $result_img['cimgcom'];?>
		  </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
      
    </div>
  </div>
<!-- Modal -->		
			  
				<?PHP  
					} // while($result_img = mysqli_fetch_array($query_img))
				} // end if ($numrow_img==0){
				?>
			  </div>
				</div>
			  </div>
	    	 <!-- /.card -->

