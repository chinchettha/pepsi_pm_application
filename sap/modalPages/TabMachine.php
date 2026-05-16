<?PHP 
//Search Database Machine

	$SQLmc = " SELECT * FROM view_zone where idzone ='$Zone' and idwkctrtype = '$Wktype' ";
	$querymc = mysqli_query($link, $SQLmc) or die ("Error Query [".$SQLmc."]");
	$nummc = mysqli_num_rows($querymc);
    //$rowsTL = mysqli_fetch_array($query);
    
//หาสถานะเครื่องจักรหยุดเดิน
$SQLi = " SELECT * FROM `view_lineschdul`  where idproductline ='".$rsZone["idproductline"]."' and lineday = '$startdate' ";
$qrLi = mysqli_query($link, $SQLi) or die ("Error Query [".$SQLi."]");
$numLi = mysqli_num_rows($qrLi);
//echo $SQLi;
if($numLi > 0 ){
    $rsLi = mysqli_fetch_array($qrLi);
    echo  "<p class='alert alert-warning'> Product Line ".  $rsLi["productline"] . " /  Work : ". $rsLi["uptime"] ."</p>";
}

//หาสถานะเครื่องจักรหยุดเดิน

//Search Database Machine
if($nummc > 0  ){	
	echo  "<p class='alert alert-info'> Zone ".  $rsZone["zone"] . " / ". $rsZone["zonewktype"] ."</p>";

	while($rsmc = mysqli_fetch_array($querymc)){
	?>
	<p> <?PHP  echo $rsmc["machine"];?> </p>
	<?PHP 
	} // end while($result = mysqli_fetch_array($querySQL)){
}// end if($nummc > 0  ){	

	
?>