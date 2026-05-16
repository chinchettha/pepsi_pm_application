<?PHP 
//Search Database 

	$strSQL = " SELECT * FROM  view_tarklist  where mntplan='$row[mntplan]' ";
	$querySQL = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."]");
	$totalRecords = mysqli_num_rows($querySQL);
	//$rowsTL = mysqli_fetch_array($query);
if($totalRecords > 0 && $row["mntplan"] <> "" ){	
	$i =1;
	while($result = mysqli_fetch_array($querySQL)){
		$PmTark = $result["tasklist"];
		$Wktype = $result["idwkctrtype"];
		$Zone =  $result["idzone"];		

	?>	
	<p> 
	<?PHP echo  $i ?>. <?PHP echo  $result["machinetl"] ?> - <?PHP echo  $result["pmlist"] ?> 
	<?PHP 
	if( $result["machinestatus"] == "1" ){ //check สถานะเดินเครื่อง
		echo " <i class='fa fa-cogs' style='color:red'></i> ";
	} else{
		echo " <i class='fa fa-cogs' style='color:green'></i> ";
	} //end if( $result["machinestatus"] == "1" )
	?>
	/ <?PHP echo sprintf("%03d",$result["mat"]) ?> = <?PHP echo $result["matdescrip"];?>
	</p>
	<?PHP 	
	$i++;
	} // end while( $TL = mysqli_fetch_row($querySQL) )

	//Search Zone
	$SQLzone = " SELECT * FROM view_zone where idzone ='$Zone' and idwkctrtype = '$Wktype' ";
	$queryZone = mysqli_query($link, $SQLzone) or die ("Error Query [".$SQLzone."]");
	$rsZone = mysqli_fetch_array($queryZone);
	//Search Zone

	echo "<p class='alert alert-info'>  Task List " . $PmTark .  " / " . $rsZone["productline"] . " / " . $rsZone["zone"] . " / ". $rsZone["zonewktype"] . "</p>";
	//End Search Database
} else {
	echo " ไม่ปรากฏ PM Tark List ";
}// end if($row["mntplan"])
	
	
?>