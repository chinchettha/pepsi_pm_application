<?PHP 
    /********************** เช็ตขั้นตอนการทำงานว่าถึงไหนแล้ว  ********************************* */
  
    /************** step 1 planner จ่ายงานให้ A/B แล้ว   **************** */
    $sqlST1 = "SELECT * FROM tbiw37n where idiw37='$event[idiw37]'	";  
	$qrST1 = mysqli_query($link, $sqlST1) or die ("Error Query [".$sqlST1."]");
    $numST1 = mysqli_num_rows($qrST1);    
    $rowST1 = mysqli_fetch_array($qrST1);
    if(!empty($rowST1["team"])){
        $STwork =    "/$event[idiw37]" ;
    }else {
        $STwork = "$event[idiw37]";
    }   
    /************** step 1 planner จ่ายงานให้ A/B แล้ว   **************** */

  /************** step 2 Supervisor assign ให้ช่างแล้ว **************** */
  $sqlST2 = "SELECT * FROM tbplangingwork  where idiw37='$event[idiw37]'	";  
  $qrST2 = mysqli_query($link, $sqlST2) or die ("Error Query [".$sqlST2."]");
  $numST2 = mysqli_num_rows($qrST2);    
  if($numST2 > 0){
      $STwork2 =    "/2" ;
  }else {
      $STwork2 = "";
  }   
  /************** step 2 Supervisor assign ให้ช่างแล้ว  **************** */    

    /********************** เช็ตขั้นตอนการทำงานว่าถึงไหนแล้ว  ********************************* */
?>
