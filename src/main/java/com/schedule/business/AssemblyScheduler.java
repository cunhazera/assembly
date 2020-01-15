package com.schedule.business;

import com.schedule.entity.Assembly;
import com.schedule.map.AssemblyMap;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;

public class AssemblyScheduler {

    private static final double DAY_MAXIMUM_MINUTES = 420;
    private SimpleDateFormat simpleDateFormat = new SimpleDateFormat("HH:mm");

    public void createProductionLines() throws URISyntaxException, IOException {
        Path output = outputFile();
        List<Assembly> assemblies = new AssemblyMap().mapFileInputToAssembly();
        int lines = numberOfLines(assemblies);
        int lastIndex = 0;
        for (int i = 0; i < lines; i++) {
            Calendar startTime = timeInstance(9);
            Files.write(output, String.format("Linha de montagem %d\n", i + 1).getBytes(), StandardOpenOption.APPEND);
            lastIndex = addProductionStep(output, assemblies, lastIndex, startTime);
            Files.write(output, String.format("%s %s\n\n", simpleDateFormat.format(startTime.getTime()), "Ginastica Laboral").getBytes(), StandardOpenOption.APPEND);
        }
    }

    private Path outputFile() throws URISyntaxException, IOException {
        Path output = Paths.get(getClass().getClassLoader().getResource("output.txt").toURI());
        Files.write(output, "".getBytes(), StandardOpenOption.TRUNCATE_EXISTING);
        return output;
    }

    private int numberOfLines(List<Assembly> assemblies) {
        Double totalTime = assemblies.stream().map(e -> e.getMinutes()).reduce(0, Integer::sum).doubleValue();
        return new BigDecimal(totalTime / DAY_MAXIMUM_MINUTES).setScale(0, RoundingMode.UP).intValue();
    }

    private int addProductionStep(Path output, List<Assembly> assemblies, int lastIndex, Calendar startTime) throws IOException {
        Calendar fiveAfternoon = timeInstance(17);
        for (int j = lastIndex; j < assemblies.size(); j++) {
            lastIndex = j;
            Assembly assembly = assemblies.get(lastIndex);
            Calendar temp = (Calendar) startTime.clone();
            temp.add(Calendar.MINUTE, assembly.getMinutes());
            if (startTime.getTime().before(fiveAfternoon.getTime()) && temp.getTime().before(fiveAfternoon.getTime())) {
                Files.write(output, String.format("%s %s\n", simpleDateFormat.format(startTime.getTime()), assembly.getName()).getBytes(), StandardOpenOption.APPEND);
                startTime.add(Calendar.MINUTE, assembly.getMinutes());
                if (startTime.get(Calendar.HOUR_OF_DAY) == 12) {
                    Files.write(output, String.format("%s %s\n", simpleDateFormat.format(startTime.getTime()), "Almoço").getBytes(), StandardOpenOption.APPEND);
                    startTime.add(Calendar.MINUTE, 60);
                }
            } else {
                break;
            }
        }
        return lastIndex;
    }

    private Calendar timeInstance(int hourOfDay) {
        Calendar instance = Calendar.getInstance();
        instance.set(Calendar.HOUR_OF_DAY, hourOfDay);
        instance.set(Calendar.MINUTE, 0);
        instance.set(Calendar.SECOND, 0);
        return instance;
    }

}
