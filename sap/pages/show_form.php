<?PHP 
$filed1 = $filed[1];
?>
<input type="hidden" name="<?php echo $filed1; ?>" value="<?php echo $_GET["$filed1"]; ?>">

<?PHP 
for($i=2;$i<=$numfiled;$i++){
						$Field = $filed[$i];
						//*******   กำหนดค่าแสดงในฟอร์ม  $filed[?] = "Field,Label,ชนิด D=วันที่  หรือ FK=FOREIGN KEY:tb:Field return ,R=required,H=hidden,IC=include File:Filename"; // id คีย์หลัก   */
						$Field = explode(',' ,$Field);
						$ValText =  $Field[0];
						$LabText = $Field[1];
						$TextType = explode(":", $Field[2]);
						$Required = $Field[3];
						$Hidden = $Field[4];
						$Include = $Field[5];

						switch(trim($TextType[0])) {
							case "D":
								if(!empty(trim($result[$ValText])) ){
									$rsText = date("d.m.Y", $result[$ValText] );	
								}else{
									$rsText = "";
								}							
								break;
							case "FK":
								$rsText = ShowDetail($TextType[1],$ValText,$result[$ValText],$TextType[2]) ;// $tb=Table,  $a=Field Where , $b=Value Search , $c=Field Return1
								break;
							default:
								$rsText = $result[$ValText];
						}// end switch($TextType[0]) 

						
						if($Hidden == "H"){ //หาค่า hidden
							$Hidden = "H";
						}else{
							$Hidden = "S";
						}//หาค่า hidden

						if($Required == "R"){ //หาค่า required
							$Required = "required";
						}else {
							$Required = "";
						} //หาค่า required
						////*******   กำหนดค่าแสดงในฟอร์ม  $filed[?] = "Field,Label,ชนิด D=วันที่ หรือ S=Select,R=required,H=hidden"; // id คีย์หลัก   */
						
						if($Hidden == "S") { //ถ้าไม่ hidden ให้แสดง
							$Include = explode(":", $Include);
							if($Include[0] =="IC"){
								$filename = $Include[1];
								$filename .= ".php";
								include_once($filename);
							}else{
						?>
						<div class="input-group mb-3">
						<div class="input-group-prepend" >
							<span class="btn btn-info" style="width: 180px; text-align: right;"><?php echo $LabText;?> </span>
						</div>
							<input type="text" class="form-control " placeholder="" id="<?php echo $ValText;?>" name="<?php echo $ValText;?>" value="<?php echo  $rsText;?>" data-toggle="tooltip"  data-placement="top" title="<?php echo $LabText;?>" style="font-weight:bold;"  <?PHP echo $Required;?>   >
						</div>	
						<?PHP 
							} // end if($Include[0] =="IC")
						} //ถ้าไม่ hidden ให้แสดง
                    } // end for($i=1;$i<=$numfiled;$i++)
?>                    
	