package com.schedule;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

public class Main {

    private static final int DAY_MAXIMUM_MINUTES = 420;

    public static void main(String[] args) throws URISyntaxException, IOException {
        Main main = new Main();
        main.asd();
    }

    public void asd() throws URISyntaxException, IOException {
        Path input = Paths.get(getClass().getClassLoader().getResource("input.txt").toURI());
        Path output = Paths.get(getClass().getClassLoader().getResource("output.txt").toURI());
        Files.write(output, "".getBytes(), StandardOpenOption.TRUNCATE_EXISTING);
        int totalMinutes = 0;
        for (String text : Files.readAllLines(input)) {
            if (!text.substring(text.length() - 3).equals("min")) {
                totalMinutes += 5;
            } else {
                int time = Integer.valueOf(text.substring(text.length() - 5, text.length() - 3));
                totalMinutes += time;
            }
        }
        int lines = new BigDecimal(new Double(totalMinutes) / new Double(DAY_MAXIMUM_MINUTES)).setScale(0, RoundingMode.UP).intValue();
        totalMinutes = 0;
        for (int i = 0; i < lines; i++) {
            Files.write(output, String.format("Linha %s\n", i + 1).getBytes(), StandardOpenOption.APPEND);
            for (String text : Files.readAllLines(input)) {
                if (!text.substring(text.length() - 3).equals("min")) {
                    totalMinutes += 5;
                } else {
                    int time = Integer.valueOf(text.substring(text.length() - 5, text.length() - 3));
                    totalMinutes += time;
                }
            }
        }
        System.out.println(totalMinutes);
    }

}
